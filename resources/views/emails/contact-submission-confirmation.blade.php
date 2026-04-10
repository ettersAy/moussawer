<x-mail::message>
# We Received Your Message

Thank you for reaching out to Moussawer! We've received your contact form submission.

**Your Email:** {{ $email }}

**Your Message:**
> {{ $message }}

**Submitted At:** {{ $submittedAt->format('F j, Y \a\t g:i A') }}

---

Our team will review your message and get back to you as soon as possible. If your inquiry is urgent, please feel free to contact us directly.

<x-mail::button :url="'https://moussawer.local'">
Visit Moussawer
</x-mail::button>

Thanks,  
**The Moussawer Team**
</x-mail::message>
