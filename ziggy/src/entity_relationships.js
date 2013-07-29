if (typeof enketo === "undefined" || !enketo) {
    var enketo = {};
}

enketo.EntityRelationships = function(jsonDefinition, formDefinition) {
    "use strict";

    var determineEntities = function() {
        var entityDefinitions = new enketo.EntityDefinitions();
        if (enketo.hasValue(jsonDefinition)) {
            jsonDefinition.forEach(function(relation) {
                var entity = entityDefinitions.findEntityDefinitionByType(relation.parent);
                if (!enketo.hasValue(entity)) {
                    entityDefinitions.add(new enketo.EntityDef(relation.parent));
                }
                entity = entityDefinitions.findEntityDefinitionByType(relation.child);
                if (!enketo.hasValue(entity)) {
                    entityDefinitions.add(new enketo.EntityDef(relation.child));
                }
            });
        }

        if (enketo.hasValue(formDefinition.form.bind_type) && !enketo.hasValue(entityDefinitions.findEntityDefinitionByType(formDefinition.form.bind_type))) {
            entityDefinitions.add(new enketo.EntityDef(formDefinition.form.bind_type));
        }
        return entityDefinitions;
    };

    return {
        determineEntitiesAndRelations: function() {
            var entityDefinitions = determineEntities();
            if (!enketo.hasValue(jsonDefinition)) {
                return entityDefinitions;
            }
            jsonDefinition.forEach(function(relation) {
                var parentEntityDefinition = entityDefinitions.findEntityDefinitionByType(relation.parent);
                if (!enketo.hasValue(parentEntityDefinition.relations)) {
                    parentEntityDefinition.removeAllRelations();
                }
                parentEntityDefinition.addRelation(new enketo.RelationDef(relation.child, relation.kind, "parent", relation.from, relation.to));

                var childEntityDefinition = entityDefinitions.findEntityDefinitionByType(relation.child);
                if (!enketo.hasValue(childEntityDefinition.relations)) {
                    childEntityDefinition.removeAllRelations();
                }
                childEntityDefinition.addRelation(new enketo.RelationDef(relation.parent, enketo.RelationKind[relation.kind].inverse.type, "child", relation.to, relation.from));
            });
            return entityDefinitions;
        }
    };
};