https://stackoverflow.com/questions/17811451/implementing-a-many-to-many-relationship-with-backbone-relational

var PersonCollection = Backbone.Collection.extend(
    {
        model: Person,

        url: "/api/person",
    });

var PersonGroupCollection = Backbone.Collection.extend(
    {
        model: PersonGroup,

        url: "/api/persongroup",
    });

var PersonModels = new PersonCollection();
var GroupsModels = new PersonGroupCollection();

PersonModels.fetch();

GroupsModels.fetch();

People = kb.collectionObservable(
    PersonModels,
    {
        factories:
            {
                "models": PersonViewModel,
            },
    }
);

PersonGroups = kb.collectionObservable(
    GroupsModels,
    {
        factories:
            {
                "models": PersonGroupViewModel,
                "models.People.models": PersonViewModel,
            },
    }
);
