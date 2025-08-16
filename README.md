# Bookhushly - African Hospitality & Service Platform

A comprehensive platform connecting customers with verified hospitality, logistics, and security service providers across Nigeria and Africa.

## 🚀 Features

- **Multi-role Authentication**: Customer, Vendor, and Admin roles
- **KYC Verification**: Comprehensive vendor verification system
- **Service Listings**: Create and manage service offerings
- **Booking System**: Real-time booking with status tracking
- **Payment Integration**: Paystack and Flutterwave support
- **Review System**: Customer feedback and ratings
- **Admin Dashboard**: Platform management and analytics
- **Notifications**: Real-time updates and alerts

## 🛠 Tech Stack

- **Frontend**: Next.js 13, React, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: Zustand
- **Payments**: Paystack, Flutterwave
- **Deployment**: Netlify

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd bookhushly
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:

```bash
npm run dev
```

## 🗄️ Database Setup

The platform uses Supabase with the following tables:

- `users` - User profiles and authentication
- `vendors` - Vendor business information and KYC data
- `listings` - Service offerings
- `bookings` - Customer bookings and reservations
- `reviews` - Customer reviews and ratings
- `notifications` - System notifications
- `payments` - Payment tracking and history

### Database Migration

Run the SQL migration files in your Supabase SQL editor in this order:

1. `create_users_table.sql`
2. `create_vendors_table.sql`
3. `create_listings_table.sql`
4. `create_bookings_table.sql`
5. `create_reviews_table.sql`
6. `create_notifications_table.sql`
7. `create_payments_table.sql`
8. `create_functions_and_triggers.sql`

## 🔐 Authentication

The platform supports:

- Email/password authentication
- Role-based access control (Customer, Vendor, Admin)
- Automatic user profile creation
- Session management with Zustand

## 💳 Payment Integration

### Paystack Setup

1. Get your API keys from [Paystack Dashboard](https://dashboard.paystack.com)
2. Add to environment variables:

```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
```

### Flutterwave Setup

1. Get your API keys from [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Add to environment variables:

```
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
```

## 🚀 Deployment

### Netlify Deployment

1. Build the project:

```bash
npm run build
```

2. Deploy to Netlify:

- Connect your repository to Netlify
- Set build command: `npm run build`
- Set publish directory: `out`
- Add environment variables in Netlify dashboard

## 📱 Usage

### For Customers

1. Register with email and password
2. Browse available services
3. Book services with instant confirmation
4. Make secure payments
5. Leave reviews after service completion

### For Vendors

1. Register as a vendor
2. Complete KYC verification
3. Create service listings
4. Manage bookings and customer requests
5. Receive payments and track earnings

### For Admins

1. Access admin dashboard
2. Review and approve vendor applications
3. Monitor platform analytics
4. Manage users and content

## 🔧 Configuration

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Paystack (Optional)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Flutterwave (Optional)
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@bookhushly.com or create an issue in the repository.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced search and filtering
- [ ] AI-powered recommendations
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] API for third-party integrations

---

Built with ❤️ for Africa by the Bookhushly team.
