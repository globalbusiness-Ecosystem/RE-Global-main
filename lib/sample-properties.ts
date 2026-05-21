/**
 * Sample properties data with images
 * يمكنك استبدال هذه الصور برابط الصور الحقيقية من خادمك
 */

export const SAMPLE_PROPERTIES = [
  {
    id: '1',
    titleEn: 'Luxury Penthouse Dubai Marina',
    titleAr: 'بنتهاوس فاخر دبي مارينا',
    descriptionEn: 'Stunning luxury penthouse with breathtaking marina and skyline views. High-end finishes, smart home system, private pool access.',
    descriptionAr: 'بنتهاوس فاخر مذهل مع إطلالات خلابة على المارينا وخط الأفق. تشطيبات عالية الجودة، نظام منزل ذكي، إمكانية الوصول إلى حمام سباحة خاص.',
    price: 5000,
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryFlag: '🇦🇪',
    bedrooms: 4,
    bathrooms: 3,
    area: 350,
    yearBuilt: 2022,
    images: [
      {
        id: 'img-1-1',
        url: '/placeholder.jpg',
        alt: 'Main bedroom with sea view',
        title: 'Master Bedroom'
      },
      {
        id: 'img-1-2',
        url: '/placeholder.jpg',
        alt: 'Living room with panoramic windows',
        title: 'Living Room'
      },
      {
        id: 'img-1-3',
        url: '/placeholder.jpg',
        alt: 'Modern kitchen with island',
        title: 'Kitchen'
      },
      {
        id: 'img-1-4',
        url: '/placeholder.jpg',
        alt: 'Pool deck with marina view',
        title: 'Pool Deck'
      },
      {
        id: 'img-1-5',
        url: '/placeholder.jpg',
        alt: 'Building exterior',
        title: 'Exterior'
      }
    ],
    amenities: ['Gym', 'Swimming Pool', 'Parking', 'Security', 'Smart Home', 'Sauna'],
    contact: {
      name: 'Ahmed Al-Mansouri',
      phone: '+971501234567',
      email: 'ahmed@replatform.com'
    }
  },
  {
    id: '2',
    titleEn: 'Modern Villa Cairo Heliopolis',
    titleAr: 'فيلا حديثة القاهرة هليوبوليس',
    descriptionEn: 'Contemporary villa in premium location. Spacious gardens, multiple living areas, modern architecture.',
    descriptionAr: 'فيلا معاصرة في موقع متميز. حدائق واسعة، مناطق معيشة متعددة، عمارة حديثة.',
    price: 800,
    city: 'Cairo',
    country: 'Egypt',
    countryFlag: '🇪🇬',
    bedrooms: 5,
    bathrooms: 4,
    area: 500,
    yearBuilt: 2021,
    images: [
      {
        id: 'img-2-1',
        url: '/placeholder.jpg',
        alt: 'Front elevation',
        title: 'Front View'
      },
      {
        id: 'img-2-2',
        url: '/placeholder.jpg',
        alt: 'Garden area',
        title: 'Garden'
      },
      {
        id: 'img-2-3',
        url: '/placeholder.jpg',
        alt: 'Dining room',
        title: 'Dining'
      },
      {
        id: 'img-2-4',
        url: '/placeholder.jpg',
        alt: 'Backyard',
        title: 'Backyard'
      }
    ],
    amenities: ['Garden', 'Garage', 'Terrace', 'Maid Room', 'Courtyard'],
    contact: {
      name: 'Fatima Al-Zahra',
      phone: '+201001234567',
      email: 'fatima@replatform.com'
    }
  },
  {
    id: '3',
    titleEn: 'Beachfront Apartment Miami',
    titleAr: 'شقة على الواجهة البحرية ميامي',
    descriptionEn: 'Premium beachfront property with direct beach access, modern amenities, and spectacular ocean views.',
    descriptionAr: 'عقار فاخر على الواجهة البحرية مع إمكانية الوصول المباشر إلى الشاطئ، مرافق حديثة، وإطلالات خيالية على المحيط.',
    price: 1200,
    city: 'Miami',
    country: 'United States',
    countryFlag: '🇺🇸',
    bedrooms: 3,
    bathrooms: 2,
    area: 200,
    yearBuilt: 2020,
    images: [
      {
        id: 'img-3-1',
        url: '/placeholder.jpg',
        alt: 'Beachfront view',
        title: 'Beachfront'
      },
      {
        id: 'img-3-2',
        url: '/placeholder.jpg',
        alt: 'Master suite',
        title: 'Master Suite'
      },
      {
        id: 'img-3-3',
        url: '/placeholder.jpg',
        alt: 'Balcony',
        title: 'Balcony'
      }
    ],
    amenities: ['Beach Access', 'Concierge', 'Fitness Center', 'Parking', 'Security'],
    contact: {
      name: 'John Smith',
      phone: '+13055551234',
      email: 'john@replatform.com'
    }
  }
];

export type SampleProperty = typeof SAMPLE_PROPERTIES[0];
