define(['EntityDef', 'EntityDefinitions', 'RelationDef', 'RelationKind', 'Util'], function (EntityDef, EntityDefinitions, RelationDef, RelationKind, Util) {
    "use strict";

    var determineEntities = function (jsonDefinition, formDefinition) {
        var entityDefinitions = EntityDefinitions.newInstance();
        if (Util.hasValue(jsonDefinition)) {
            jsonDefinition.forEach(function (relation) {
                var entity = entityDefinitions.findEntityDefinitionByType(relation.parent);
                if (!Util.hasValue(entity)) {
                    entityDefinitions.add(EntityDef.newInstance(relation.parent));
                }
                entity = entityDefinitions.findEntityDefinitionByType(relation.child);
                if (!Util.hasValue(entity)) {
                    entityDefinitions.add(EntityDef.newInstance(relation.child));
                }
            });
        }

        if (Util.hasValue(formDefinition.form.bind_type) && !Util.hasValue(entityDefinitions.findEntityDefinitionByType(formDefinition.form.bind_type))) {
            entityDefinitions.add(EntityDef.newInstance(formDefinition.form.bind_type));
        }
        return entityDefinitions;
    };

    return {
        determineEntitiesAndRelations: function (jsonDefinition, formDefinition) {
            var entityDefinitions = determineEntities(jsonDefinition, formDefinition);
            if (!Util.hasValue(jsonDefinition)) {
                return entityDefinitions;
            }
            jsonDefinition.forEach(function (relation) {
                var parentEntityDefinition = entityDefinitions.findEntityDefinitionByType(relation.parent);
                if (!Util.hasValue(parentEntityDefinition.relations)) {
                    parentEntityDefinition.removeAllRelations();
                }
                parentEntityDefinition.addRelation(RelationDef.newInstance(relation.child, relation.kind, "parent", relation.from, relation.to));

                var childEntityDefinition = entityDefinitions.findEntityDefinitionByType(relation.child);
                if (!Util.hasValue(childEntityDefinition.relations)) {
                    childEntityDefinition.removeAllRelations();
                }
                childEntityDefinition.addRelation(RelationDef.newInstance(relation.parent, RelationKind[relation.kind].inverse.type, "child", relation.to, relation.from));
            });
            return entityDefinitions;
        }
    };
});