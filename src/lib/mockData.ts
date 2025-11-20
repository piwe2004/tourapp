export interface TravelPlace {
    id: string;
    name: string;
    description: string;
    address: string;
    imageUrl: string;
    time: string;
}

export const MOCK_COURSE: TravelPlace[] = [
    {
        id: '1',
        name: 'Gyeongbokgung Palace',
        description: 'The main royal palace of the Joseon dynasty. Built in 1395, it is located in northern Seoul.',
        address: '161 Sajik-ro, Jongno-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1538669714434-2d1177356973?q=80&w=2070&auto=format&fit=crop',
        time: '10:00 AM'
    },
    {
        id: '2',
        name: 'Bukchon Hanok Village',
        description: 'A Korean traditional village in Seoul with a long history.',
        address: '37, Gyedong-gil, Jongno-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1583243538423-32430e6d7672?q=80&w=2070&auto=format&fit=crop',
        time: '12:00 PM'
    },
    {
        id: '3',
        name: 'N Seoul Tower',
        description: 'A communication and observation tower located on Namsan Mountain in central Seoul.',
        address: '105 Namsangongwon-gil, Yongsan-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1535126320463-c501b2460d1e?q=80&w=2070&auto=format&fit=crop',
        time: '03:00 PM'
    },
    {
        id: '4',
        name: 'Myeongdong Shopping Street',
        description: 'One of the primary shopping districts in Seoul.',
        address: 'Myeongdong-gil, Jung-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1536242882587-492e432e46f7?q=80&w=2068&auto=format&fit=crop',
        time: '06:00 PM'
    },
    {
        id: '5',
        name: 'Cheonggyecheon Stream',
        description: 'A 10.9-kilometer-long, modern public recreation space in downtown Seoul.',
        address: 'Cheonggyecheon-ro, Jongno-gu, Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1622606858570-4c2226248279?q=80&w=2070&auto=format&fit=crop',
        time: '08:00 PM'
    }
];
