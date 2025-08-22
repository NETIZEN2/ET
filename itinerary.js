(function(global){
  const itineraryArray = [
    {
      date: '2023-09-12',
      travel: 'Brisbane, Australia > Singapore > Paris, France',
      accommodation: null,
      activities: []
    },
    {
      date: '2023-09-13',
      accommodation: {
        name: 'Pullman Paris',
        address: '18 Avenue De Suffren, Entrée au 22 rue Jean Rey, 15th arr., 75015 Paris, France',
        checkIn: '16:00',
        checkOut: null
      },
      activities: [
        { start: '07:45', end: '08:45', title: 'Arrive Paris, France' },
        { start: '09:00', end: '16:00', title: 'Uber from airport to Pullman, drop bags off, walk around Paris, sight see' }
      ],
      travel: null
    },
    {
      date: '2023-09-14',
      accommodation: {
        name: 'Pullman Paris',
        address: '18 Avenue De Suffren, Entrée au 22 rue Jean Rey, 15th arr., 75015 Paris, France',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '08:45', end: '17:00', title: 'Paris in a Day Tour' }
      ],
      travel: null
    },
    {
      date: '2023-09-15',
      accommodation: {
        name: 'Hotel Lafayette',
        address: '6, rue Buffault, 9th arr., 75009 Paris, France',
        checkIn: '15:00',
        checkOut: '11:00',
        bookingRef: 'XYZ123'
      },
      activities: [
        { start: '12:30', end: '15:00', title: 'Eiffel Tower visit', description: 'Guided tour of the Eiffel Tower' }
      ],
      travel: 'Check out Pullman Paris; move to Hotel Lafayette'
    },
    {
      date: '2023-09-16',
      accommodation: {
        name: 'Hotel Lafayette',
        address: '6, rue Buffault, 9th arr., 75009 Paris, France',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '10:00', end: '16:00', title: 'Palace Versailles and Gardens tour' }
      ],
      travel: null
    },
    {
      date: '2023-09-17',
      accommodation: {
        name: 'Hotel Lafayette',
        address: '6, rue Buffault, 9th arr., 75009 Paris, France',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '10:00', end: '12:00', title: 'Catacombs visit' }
      ],
      travel: null
    },
    {
      date: '2023-09-18',
      accommodation: {
        name: 'a&o Berlin Mitte (Hostel)',
        address: 'Köpenicker Str. 127-129, Mitte, 10179 Berlin, Germany',
        checkIn: '15:00',
        checkOut: null
      },
      activities: [],
      travel: 'Paris, France > Berlin, Germany @ 07:35 (Arrive 09:20)'
    },
    {
      date: '2023-09-19',
      accommodation: {
        name: 'a&o Berlin Mitte (Hostel)',
        address: 'Köpenicker Str. 127-129, Mitte, 10179 Berlin, Germany',
        checkIn: null,
        checkOut: null
      },
      activities: [],
      travel: null
    },
    {
      date: '2023-09-20',
      accommodation: {
        name: 'a&o Berlin Mitte (Hostel)',
        address: 'Köpenicker Str. 127-129, Mitte, 10179 Berlin, Germany',
        checkIn: null,
        checkOut: null
      },
      activities: [],
      travel: null
    },
    {
      date: '2023-09-21',
      accommodation: {
        name: 'Hotel al Graspo De Ua',
        address: 'S. Marco 5094, San Marco, 30124 Venice, Italy',
        checkIn: '14:00',
        checkOut: null
      },
      activities: [],
      travel: 'Berlin, Germany > Venice, Italy @ 18:15 (Arrive 19:55)'
    },
    {
      date: '2023-09-22',
      accommodation: {
        name: 'Hotel al Graspo De Ua',
        address: 'S. Marco 5094, San Marco, 30124 Venice, Italy',
        checkIn: null,
        checkOut: null
      },
      activities: [],
      travel: null
    },
    {
      date: '2023-09-23',
      accommodation: {
        name: 'Residence La Repubblica',
        address: 'Piazza della Repubblica 4, 50123 Florence, Italy',
        checkIn: '15:00',
        checkOut: null
      },
      activities: [
        { start: '11:26', end: '13:39', title: 'Train Venice to Florence' },
        { start: '13:39', end: '23:59', title: 'Sight see' }
      ],
      travel: 'Venice, Italy > Florence, Italy @ 11:26 (Arrive 13:39)'
    },
    {
      date: '2023-09-24',
      accommodation: {
        name: 'Residence La Repubblica',
        address: 'Piazza della Repubblica 4, 50123 Florence, Italy',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '07:45', end: '20:00', title: '12hr Tuscany Day Trip from Florence, Sienna, Pisa' }
      ],
      travel: null
    },
    {
      date: '2023-09-25',
      accommodation: {
        name: 'Roman Holiday Suites',
        address: '60 Via Machiavelli, Central Station, 00185 Rome, Italy',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '12:48', end: '14:25', title: 'Train Florence to Rome' },
        { start: '14:30', end: '23:59', title: 'Sight see' }
      ],
      travel: 'Florence, Italy > Rome, Italy @ 12:48 (Arrive 14:25)'
    },
    {
      date: '2023-09-26',
      accommodation: {
        name: 'Roman Holiday Suites',
        address: '60 Via Machiavelli, Central Station, 00185 Rome, Italy',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '08:30', end: '17:00', title: 'Rome in a day tour' }
      ],
      travel: null
    },
    {
      date: '2023-09-27',
      accommodation: {
        name: 'Roman Holiday Suites',
        address: '60 Via Machiavelli, Central Station, 00185 Rome, Italy',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '06:26', end: '08:29', title: 'Train Rome to Naples' },
        { start: '18:30', end: '19:40', title: 'Train Naples to Rome' }
      ],
      travel: null
    },
    {
      date: '2023-09-28',
      accommodation: {
        name: 'Roman Holiday Suites',
        address: '60 Via Machiavelli, Central Station, 00185 Rome, Italy',
        checkIn: null,
        checkOut: null
      },
      activities: [],
      travel: null
    },
    {
      date: '2023-09-29',
      accommodation: {
        name: 'Hotel Des Victoires',
        address: '204-212 Avenue Francis Tonner, Cannes La Bocca, 06150, France',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '10:40', end: '11:50', title: 'Flight Rome to Nice' },
        { start: '11:50', end: '13:00', title: 'Taxi to Cannes' }
      ],
      travel: 'Rome, Italy > Nice, France @ 10:40 (Arrive 11:50)'
    },
    {
      date: '2023-09-30',
      accommodation: {
        name: 'Westminster Hotel & Spa Nice',
        address: '27 Promenade Des Anglais Nice, France, 06000',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '09:00', end: '10:00', title: 'Travel Cannes to Nice' }
      ],
      travel: null
    },
    {
      date: '2023-10-01',
      accommodation: {
        name: 'Westminster Hotel & Spa Nice',
        address: '27 Promenade Des Anglais Nice, France, 06000',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '09:00', end: '10:00', title: 'Travel Nice to Monaco' },
        { start: '18:00', end: '19:00', title: 'Travel Monaco to Nice' }
      ],
      travel: null
    },
    {
      date: '2023-10-02',
      accommodation: {
        name: 'Catalunya',
        address: 'Santa Anna, 24, Ciutat Vella, 08002 Barcelona, Spain',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '11:40', end: '12:55', title: 'Flight Nice to Barcelona' }
      ],
      travel: 'Nice, France > Barcelona, Spain @ 11:40 (Arrive 12:55)'
    },
    {
      date: '2023-10-03',
      accommodation: {
        name: 'Catalunya',
        address: 'Santa Anna, 24, Ciutat Vella, 08002 Barcelona, Spain',
        checkIn: null,
        checkOut: null
      },
      activities: [],
      travel: null
    },
    {
      date: '2023-10-04',
      accommodation: {
        name: 'Catalunya',
        address: 'Santa Anna, 24, Ciutat Vella, 08002 Barcelona, Spain',
        checkIn: null,
        checkOut: null
      },
      activities: [],
      travel: null
    },
    {
      date: '2023-10-05',
      accommodation: {
        name: 'Plaza Hotel Capitole Toulouse',
        address: '7 Place du Capitole, 31000 Toulouse, France',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '09:28', end: '11:37', title: 'Train Barcelona to Narbonne' },
        { start: '13:02', end: '14:17', title: 'Train Narbonne to Toulouse' }
      ],
      travel: 'Barcelona, Spain > Narbonne, France @ 09:28 (Arrive 11:37); Narbonne, France > Toulouse, France @ 13:02 (Arrive 14:17)'
    },
    {
      date: '2023-10-06',
      accommodation: {
        name: 'Plaza Hotel Capitole Toulouse',
        address: '7 Place du Capitole, 31000 Toulouse, France',
        checkIn: null,
        checkOut: null
      },
      activities: [],
      travel: null
    },
    {
      date: '2023-10-07',
      accommodation: {
        name: '2 Place Saint-Projet',
        address: '2 Place Saint-Projet, Bordeaux City-Centre, 33000 Bordeaux, France',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '12:15', end: '14:40', title: 'Train Toulouse to Bordeaux' }
      ],
      travel: 'Toulouse, France > Bordeaux, France @ 12:15 (Arrive 14:40)'
    },
    {
      date: '2023-10-08',
      accommodation: {
        name: '2 Place Saint-Projet',
        address: '2 Place Saint-Projet, Bordeaux City-Centre, 33000 Bordeaux, France',
        checkIn: null,
        checkOut: null
      },
      activities: [],
      travel: null
    },
    {
      date: '2023-10-09',
      accommodation: {
        name: '2 Place Saint-Projet',
        address: '2 Place Saint-Projet, Bordeaux City-Centre, 33000 Bordeaux, France',
        checkIn: null,
        checkOut: null
      },
      activities: [],
      travel: null
    },
    {
      date: '2023-10-10',
      accommodation: {
        name: '2 Rue de la Fronde',
        address: '2 Rue de la Fronde, 5th arrondissement, 69005 Lyon, France',
        checkIn: null,
        checkOut: null
      },
      activities: [
        { start: '15:15', end: '16:25', title: 'Flight Bordeaux to Lyon' }
      ],
      travel: 'Bordeaux, France > Lyon, France @ 15:15 (Arrive 16:25)'
    },
    {
      date: '2023-10-11',
      accommodation: {
        name: '2 Rue de la Fronde',
        address: '2 Rue de la Fronde, 5th arrondissement, 69005 Lyon, France',
        checkIn: null,
        checkOut: null
      },
      activities: [],
      travel: null
    },
    {
      date: '2023-10-12',
      accommodation: {
        name: '2 Rue de la Fronde',
        address: '2 Rue de la Fronde, 5th arrondissement, 69005 Lyon, France',
        checkIn: null,
        checkOut: null
      },
      activities: [],
      travel: null
    },
    {
      date: '2023-10-13',
      accommodation: null,
      activities: [],
      travel: 'Lyon, France > Paris, France @ 10:20 (Arrive 11:30); Paris, France > Singapore > Brisbane, Australia > Canberra, Australia'
    }
  ];

  const itinerary = itineraryArray.reduce((acc, { date, ...rest }) => {
    acc[date] = rest;
    return acc;
  }, {});

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = itinerary;
  } else {
    global.itinerary = itinerary;
  }
})(this);
