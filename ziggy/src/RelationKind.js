define(function () {
    var RelationKind = {
        one_to_one: {type: "one_to_one"},
        one_to_many: {type: "one_to_many"},
        many_to_one: {type: "many_to_one"}
    };

    RelationKind.one_to_one.inverse = RelationKind.one_to_one;
    RelationKind.one_to_many.inverse = RelationKind.many_to_one;
    RelationKind.many_to_one.inverse = RelationKind.one_to_many;

    return RelationKind;
});


