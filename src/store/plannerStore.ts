import { create } from 'zustand';

interface DateRange {
    start: Date;
    end: Date;
}

interface Guests {
    adult: number;
    teen: number;
    child: number;
}

interface PlannerState {
    destination: string;
    dateRange: DateRange;
    guests: Guests;
    activeEditor: 'date' | 'guest' | 'destination' | null;
    
    setDestination: (dest: string) => void;
    setDateRange: (range: DateRange) => void;
    setGuests: (guests: Guests) => void;
    setActiveEditor: (type: 'date' | 'guest' | 'destination' | null) => void;
}

export const usePlannerStore = create<PlannerState>((set) => ({
    destination: '제주',
    dateRange: {
        start: new Date(),
        end: new Date(new Date().setDate(new Date().getDate() + 2))
    },
    guests: { adult: 2, teen: 0, child: 0 },
    activeEditor: null,

    setDestination: (dest) => set({ destination: dest }),
    setDateRange: (range) => set({ dateRange: range }),
    setGuests: (guests) => set({ guests }),
    setActiveEditor: (type) => set({ activeEditor: type }),
}));
