import { Plus, Trash2 } from "lucide-react";
import type { AvailabilityRule } from "./types";
import { DAYS_SHORT } from "./utils";

type RulesListProps = {
  rules: AvailabilityRule[];
  newRule: { dayOfWeek: number; startTime: string; endTime: string };
  onNewRuleChange: (r: RulesListProps["newRule"]) => void;
  onAdd: () => void;
  onToggle: (r: AvailabilityRule) => void;
  onDelete: (id: string) => void;
};

export function RulesList({ rules, newRule, onNewRuleChange, onAdd, onToggle, onDelete }: RulesListProps) {
  return (
    <div>
      <div className="rules-section-heading">Availability Rules</div>
      <div className="rules-add-form">
        <select
          value={newRule.dayOfWeek}
          onChange={(e) => onNewRuleChange({ ...newRule, dayOfWeek: Number(e.target.value) })}
        >
          {DAYS_SHORT.map((d, i) => <option key={i} value={i}>{d}</option>)}
        </select>
        <input
          type="time"
          value={newRule.startTime}
          onChange={(e) => onNewRuleChange({ ...newRule, startTime: e.target.value })}
        />
        <input
          type="time"
          value={newRule.endTime}
          onChange={(e) => onNewRuleChange({ ...newRule, endTime: e.target.value })}
        />
        <button type="button" className="solid-button compact" onClick={onAdd}><Plus size={14} /></button>
      </div>
      <div className="rules-compact-list">
        {rules.map((rule) => (
          <div key={rule.id} className={`rule-compact-row${rule.isActive === false ? " inactive" : ""}`}>
            <span className="rule-compact-day">{DAYS_SHORT[rule.dayOfWeek]}</span>
            <span className="rule-compact-time">{rule.startTime} – {rule.endTime}</span>
            <button
              type="button"
              className="ghost-button compact"
              style={{ fontSize: "0.7rem", padding: "2px 6px" }}
              onClick={() => onToggle(rule)}
              title={rule.isActive === false ? "Activate" : "Deactivate"}
            >
              {rule.isActive === false ? "Off" : "On"}
            </button>
            <button
              type="button"
              className="ghost-button compact"
              style={{ color: "var(--red)", fontSize: "0.7rem", padding: "2px 6px" }}
              onClick={() => onDelete(rule.id)}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {!rules.length && <p className="muted" style={{ fontSize: "0.78rem" }}>No rules set.</p>}
      </div>
    </div>
  );
}
