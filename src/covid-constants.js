export default {
  covid_status: {
    sidebarHeading: "Covid Status",

    responses: [
      {
        id: "symptoms",
        label: "I am unwell and think I have COVID-19"
      },
      {
        id: "no_symptoms",
        label: "I feel well"
      },
      {
        id: "self_isolation_after_exposure",
        label: "I feel well but isolating after COVID-19 exposure"
      },
      {
        id: "test_positive",
        label: "I am unwell and tested positive for COVID-19"
      },
      {
        id: "symptoms_not_covid",
        label: "I am unwell but don't think it's COVID-19"
      },
      {
        id: "test_positive_recovered",
        label: "I feel better now but tested positive for COVID-19"
      },
      {
        id: "symptoms_recovered",
        label: "I feel better now but think I had COVID-19"
      }
    ]
  },

  leaving_home: {
    sidebarHeading: "Leaving the house",
    responses: [
      {
        id: "not_leaving_house",
        label: "Not leaving my house at all",
        requires_days: true
      },
      {
        id: "work_and_essentials",
        label: "Only go out for work & groceries/pharmacy/exercise",
        requires_days: true
      },
      {
        id: "essentials",
        label: "Only go out for groceries/pharmacy/exercise",
        requires_days: true
      },
      {
        id: "none",
        label: "No changes"
      }
    ]
  },

  amount_of_contact: {
    sidebarHeading: "Social distancing",
    responses: [
      {
        id: "no_large_groups",
        label: "Avoiding large groups of people",
        requires_days: true
      },
      {
        id: "reduced_contact",
        label: "Reducing contact with other people",
        requires_days: true
      },
      {
        id: "minimal_contact",
        label: "Zero or minimal contact with other people",
        requires_days: true
      },
      {
        id: "none",
        label: "None"
      }
    ]
  },

  work_current: {
    sidebarHeading: "Current work (or study)",
    responses: [
      {
        id: "car",
        label: "Commute by car"
      },
      {
        id: "retired",
        label: "Retired or not working"
      },
      {
        id: "wfh",
        label: "Working or studying from home"
      },
      {
        id: "public_transport",
        label: "Commute by Bus, Train or Tube"
      },
      {
        id: "bike_or_walk",
        label: "Commute by bike or walking"
      }
    ]
  }
};
