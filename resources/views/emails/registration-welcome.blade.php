<x-mail::message>
# Welcome to Moussawer! 🎉

Hi **{{ $userName }}**,

Welcome to Moussawer, the professional photography marketplace! Your account has been successfully created.

**Account Details:**
- **Email:** {{ $userEmail }}
- **Role:** {{ $userRole }}

---

## What's Next?

@if($userRole === 'Photographer')

### As a Photographer:
1. Complete your professional profile with a bio and hourly rate
2. Upload portfolio images to showcase your work
3. Set your availability and preferred photography styles
4. Start receiving booking requests from clients

@else

### As a Client:
1. Browse and search for professional photographers
2. View photographer portfolios and reviews
3. Book photographers for your photography needs
4. Leave reviews and ratings after completed bookings

@endif

<x-mail::button :url="$dashboardUrl">
Go to Your Dashboard
</x-mail::button>

---

## Need Help?

If you have any questions or need assistance getting started, please don't hesitate to contact our support team at support@moussawer.local or visit our help center.

---

Happy to have you on board!  
**The Moussawer Team**
</x-mail::message>
