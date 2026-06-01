export const BUSINESS = {
  name: "Mojo Pasión",
  email: "hola@mojopasion.com",

  address: {
    street: "Calle Manuel Bello Ramos, 74",
    postalCode: "38670",
    city: "Adeje",
    province: "Santa Cruz de Tenerife",
    country: "España",
    countryCode: "ES",
  },

  shipping: {
    zones: {
      tenerife: {
        name: "Tenerife",
        costCents: 500,
        costDisplay: "5,00 €",
        freeFromCents: 2500,
        deliveryDaysMin: 1,
        deliveryDaysMax: 3,
        postalCodePrefix: ["38"],
      },
      canarias: {
        name: "Resto de Canarias",
        costCents: 850,
        costDisplay: "8,50 €",
        freeFromCents: 3800,
        deliveryDaysMin: 2,
        deliveryDaysMax: 5,
        postalCodePrefix: ["35"],
      },
    },
  },

  returns: {
    days: 14,
    buyerPaysReturnShipping: true,
    incidentReportHours: 48,
  },
} as const;
