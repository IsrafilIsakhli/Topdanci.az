# TopdanBazar Project Spec

## 1. Platform Definition

TopdanBazar is a B2B wholesale lead-generation marketplace.

This is not an e-commerce platform.

The platform does not process:

- Cart
- Checkout
- Online payment
- Shipping
- Delivery tracking
- Orders
- Returns

The platform connects buyers with wholesale sellers. Buyers browse products and stores, then contact sellers outside the platform through WhatsApp, phone, or email.

## 2. Product Goal

The product goal is to help buyers discover reliable wholesale stores and products quickly, and help sellers generate qualified leads.

Primary success metrics:

- Product views
- Store views
- WhatsApp clicks
- Phone reveal clicks
- Email clicks
- Store approval rate
- Active product count
- Search success rate

Revenue can later come from visibility products:

- Featured products
- Featured stores
- Sponsored category placements
- Premium store plans
- Verified seller programs
- Analytics add-ons

Payment and billing are not part of the first production foundation, but the architecture should leave a clean path for future promotion and billing modules.

## 3. User Types

### Public Buyer

Can:

- Browse home page
- Browse categories
- Search products
- Filter products
- View product details
- View store profiles
- Contact sellers through WhatsApp, phone, or email

Cannot:

- Add to cart
- Place order
- Pay online
- Track shipping

### Seller / Store Owner

Can:

- Open a store application
- Log in
- Manage store profile
- Add products
- Upload product images
- Edit products
- View leads and analytics
- Manage store team later

### Admin

Can:

- Approve or reject stores
- Approve, reject, or deactivate products
- Manage categories
- Manage users
- Review reports
- View lead analytics
- View audit logs
- Update platform settings

## 4. Public Pages

Core public pages:

- Home
- Categories
- Products catalog
- Product details
- Stores list
- Store profile
- Contact
- Login
- Open store application

Optional later:

- Forgot password
- Reset password
- Help center
- Terms
- Privacy policy
- 404
- 500

## 5. Seller Panel Pages

Core seller pages:

- Seller dashboard
- Products list
- Add product
- Edit product
- Store profile edit
- Media library
- Leads
- Analytics
- Team
- Settings

V1 priority:

- Dashboard
- Products list
- Add/edit product
- Store profile edit
- Leads

## 6. Admin Panel Pages

Core admin pages:

- Admin dashboard
- Stores
- Store details
- Products
- Product details
- Users
- Categories
- Lead analytics
- Reports
- Audit log
- Settings

V1 priority:

- Admin dashboard
- Store approval
- Product moderation
- Category management
- Lead analytics
- Audit log

## 7. Design Rules

All UI text should be Azerbaijani.

Avoid e-commerce terminology:

- Sebet / səbət
- Sifaris / sifariş
- Odenis / ödəniş
- Checkout
- Kargo
- Catdirilma / çatdırılma
- Buy now
- Add to cart

Preferred platform terminology:

- Mehsul / məhsul
- Magaza / mağaza
- Topdansatış
- WhatsApp ilə yaz
- Telefonu göstər
- Mağazaya bax
- Razılaşma yolu ilə
- Təsdiqlənmiş mağaza
- Müraciət
- Baxış
- Klik

## 8. Non-Functional Requirements

The system must be designed for:

- 400+ stores at launch
- 500+ product images per store
- 200K+ images early scale
- 10K+ daily users initially
- 100K+ daily users later
- Image-heavy public traffic
- Search-heavy browsing
- Lead-event write spikes

Reliability targets:

- Public catalog should stay available even during admin/seller issues.
- Images must be served by CDN, not the API server.
- Heavy jobs must run through queue workers.
- The API must be stateless and horizontally scalable.
- Database access must use pagination and indexed queries.

## 9. Out of Scope for Production Foundation

Not included initially:

- Payment gateway
- Order management
- Cart
- Shipping provider integration
- Invoice generation
- Marketplace commission tracking
- In-platform buyer-seller chat

Potential future modules:

- Promotions
- Sponsored placements
- Store plans
- Billing
- Internal messaging
- Recommendation engine

