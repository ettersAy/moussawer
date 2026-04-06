<?php

namespace App\Logging;

use Monolog\LogRecord;
use Monolog\Processor\ProcessorInterface;

class TruncateFailureLogsProcessor implements ProcessorInterface
{
    private const MAX_MESSAGE_LENGTH = 900;
    private const MAX_TRACE_FRAMES = 4;   // keep only the most relevant frames

    public function __invoke(LogRecord $record): LogRecord
    {
        if (!isset($record->context['exception']) || ! $record->context['exception'] instanceof \Throwable) {
            return $record;
        }

        $exception = $record->context['exception'];

        $summary = $this->buildConciseSummary($exception);

        // Replace the huge exception object with our clean string
        $newContext = $record->context;
        $newContext['exception'] = $summary;
        $newContext['exception_class'] = get_class($exception);
        $newContext['file'] = $exception->getFile();
        $newContext['line'] = $exception->getLine();

        return $record->with(
            message: str_contains($record->message, 'Stack trace:') ? $summary : $record->message,
            context: $newContext
        );
    }

    private function buildConciseSummary(\Throwable $e): string
    {
        $message = $e->getMessage() ?: get_class($e);
        $file    = $e->getFile();
        $line    = $e->getLine();

        $traceLines = [];
        foreach (array_slice($e->getTrace(), 0, self::MAX_TRACE_FRAMES) as $frame) {
            $class = $frame['class'] ?? '';
            $func  = $frame['function'] ?? '';
            $f     = $frame['file'] ?? '[internal]';
            $l     = $frame['line'] ?? '?';

            $traceLines[] = $class 
                ? "{$class}::{$func}() → {$f}:{$l}"
                : "{$func}() → {$f}:{$l}";
        }

        $traceStr = $traceLines ? "\n→ " . implode("\n→ ", $traceLines) : '';

        $summary = "[{$message}] at {$file}:{$line}{$traceStr}";

        if (mb_strlen($summary) > self::MAX_MESSAGE_LENGTH) {
            $summary = mb_substr($summary, 0, self::MAX_MESSAGE_LENGTH - 3) . '...';
        }

        return $summary;
    }
}