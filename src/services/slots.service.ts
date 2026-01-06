export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface DaySlots {
  date: string;
  dayName: string;
  slots: TimeSlot[];
}

export class SlotsService {
  static async getDoctorSlots(
    doctorId: string,
    startDate: Date
  ): Promise<DaySlots[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const daysToShow = 7;
    const daySlots: DaySlots[] = [];

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateString = date.toISOString().split('T')[0];

      const slots = this.generateSlotsForDay(date);

      daySlots.push({
        date: dateString,
        dayName,
        slots,
      });
    }

    return daySlots;
  }

  private static generateSlotsForDay(date: Date): TimeSlot[] {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const slots: TimeSlot[] = [];

    const morningSlots = [
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
    ];
    const afternoonSlots = [
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
    ];
    const eveningSlots = ['17:00', '17:30', '18:00', '18:30', '19:00'];

    const allSlots = [...morningSlots, ...afternoonSlots, ...eveningSlots];

    allSlots.forEach((time, index) => {
      const available = isWeekend
        ? Math.random() > 0.7
        : Math.random() > 0.3;

      slots.push({
        id: `${date.toISOString().split('T')[0]}_${time}`,
        time,
        available,
      });
    });

    return slots;
  }

  static groupSlotsByPeriod(slots: TimeSlot[]): {
    morning: TimeSlot[];
    afternoon: TimeSlot[];
    evening: TimeSlot[];
  } {
    const morning = slots.filter((slot) => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 9 && hour < 12;
    });

    const afternoon = slots.filter((slot) => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 14 && hour < 17;
    });

    const evening = slots.filter((slot) => {
      const hour = parseInt(slot.time.split(':')[0]);
      return hour >= 17 && hour < 20;
    });

    return { morning, afternoon, evening };
  }
}
