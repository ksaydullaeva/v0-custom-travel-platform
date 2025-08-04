# Experience Detail Page - Usage Guide

## Overview

The enhanced Experience Detail Page is a comprehensive, responsive React component built with Tailwind CSS that displays detailed information about travel experiences and tours. It includes all the requested features and is designed to be reusable across your application.

## Features Implemented

✅ **Header Image/Gallery** - Full-width hero image with overlay and action buttons
✅ **Title and Location** - Prominent display with location information
✅ **Quick Info Box** - Duration, price, language, group size
✅ **Rating System** - Star ratings with review count
✅ **Call to Action** - Book Now button with authentication handling
✅ **Tabbed Content Sections**:
  - Overview (experience description)
  - What's Included/Excluded
  - Itinerary (day-by-day breakdown)
  - FAQ (frequently asked questions)
  - Reviews (customer testimonials)
✅ **Sticky Sidebar** - Booking summary with pricing and actions
✅ **Mobile Responsive Design** - Collapsible sections for smaller screens
✅ **Reusable Component** - Easy to use with props

## Component Structure

The experience detail page consists of:

1. **Header Section**
   - Hero image with overlay
   - Wishlist button
   - Back button
   - Title and location
   - Rating and category badge

2. **Main Content Area**
   - Mobile collapsible quick info
   - Tabbed content sections
   - Responsive grid layout

3. **Sticky Sidebar**
   - Desktop quick info
   - Booking summary
   - Price display
   - Action buttons
   - Mobile collapsible booking section

## Data Model

The component accepts an `Experience` object with the following structure:

```typescript
interface Experience {
  id: string
  title: string
  description: string
  price: number
  duration: number
  city: string
  country: string
  category: string
  rating: number
  reviews_count: number
  image_url: string
  languages?: string
  number_participants?: number
  includes?: string[]
  excludes?: string[]
  itinerary?: Array<{
    day: number
    title: string
    description: string
    duration: string
  }>
  faq?: Array<{
    question: string
    answer: string
  }>
  reviews?: Array<{
    id: string
    user_name: string
    rating: number
    comment: string
    date: string
  }>
}
```

## Usage Examples

### Basic Usage (Current Implementation)

The current implementation in `app/experiences/[id]/page.tsx` fetches data from the API and displays it:

```tsx
// The component automatically fetches data and handles loading states
export default function ExperienceDetailPage() {
  // ... existing implementation
}
```

### Reusable Component Usage

You can also create a reusable component that accepts props:

```tsx
import ExperienceDetail from '@/components/experience-detail'

// Example usage with props
<ExperienceDetail
  id="experience-123"
  title="Amazing City Tour"
  description="Explore the city with our expert guides..."
  price={99}
  duration={4}
  city="New York"
  country="USA"
  category="city-tour"
  rating={4.8}
  reviews_count={127}
  image_url="/images/city-tour.jpg"
  languages="English, Spanish"
  number_participants={15}
  includes={["Guide", "Transport", "Lunch"]}
  excludes={["Tips", "Personal expenses"]}
  onBookNow={() => handleBooking()}
/>
```

## Key Features

### 1. Responsive Design
- **Desktop**: 3-column layout with sticky sidebar
- **Tablet**: 2-column layout
- **Mobile**: Single column with collapsible sections

### 2. Tabbed Content
- **Overview**: Main description
- **Includes/Excludes**: What's covered and what's not
- **Itinerary**: Day-by-day breakdown
- **FAQ**: Common questions
- **Reviews**: Customer testimonials

### 3. Interactive Elements
- **Wishlist**: Add/remove from wishlist with database integration
- **Booking**: Redirects to booking page or custom handler
- **Mobile Collapsible**: Tap to expand/collapse sections

### 4. Authentication Integration
- Handles user authentication for wishlist and booking
- Redirects to login when needed
- Maintains user state

## Styling

The component uses:
- **Tailwind CSS** for responsive design
- **Shadcn/ui** components for consistent UI
- **Lucide React** icons
- **Custom color scheme** with primary/secondary colors

## Customization

### Colors
Update the primary color in your Tailwind config:
```css
--primary: 220 14% 96%;
--primary-foreground: 220.9 39.3% 11%;
```

### Layout
Modify the grid layout in the main container:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Main content: 2 columns on large screens */}
  <div className="lg:col-span-2">
  {/* Sidebar: 1 column on large screens */}
  <div className="lg:col-span-1">
```

### Content
All content is easily customizable through props or by modifying the component directly.

## Performance Considerations

- **Image Optimization**: Uses Next.js Image component for optimization
- **Lazy Loading**: Content loads progressively
- **State Management**: Efficient React state management
- **Database Queries**: Optimized Supabase queries

## Accessibility

- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling
- **Color Contrast**: WCAG compliant color combinations

## Future Enhancements

Potential improvements:
- Image gallery with multiple photos
- Interactive map integration
- Real-time availability checking
- Social sharing features
- Related experiences
- Booking calendar integration
- Multi-language support
- Video content integration

## Troubleshooting

### Common Issues

1. **Missing UI Components**: Ensure all shadcn/ui components are installed
2. **TypeScript Errors**: Check that the Experience interface matches your data
3. **Styling Issues**: Verify Tailwind CSS is properly configured
4. **Authentication**: Ensure auth provider is properly set up

### Debug Mode

Add console logs to debug data flow:
```tsx
console.log("Experience data:", experience)
console.log("User state:", user)
```

This enhanced Experience Detail Page provides a comprehensive, professional, and user-friendly interface for displaying travel experiences with all the requested features implemented. 