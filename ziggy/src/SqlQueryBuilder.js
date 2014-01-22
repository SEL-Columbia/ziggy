define(['ziggy/FormDataRepository', 'ziggy/RelationKind', 'ziggy/Util'], function (FormDataRepository, RelationKind, Util) {
    "use strict";

    var loadEntityObjectAndItsRelatives = function (entitiesDefinition, parentInstance, parentType, contextRelation) {
        var baseEntity = entitiesDefinition.findEntityDefinitionByType(contextRelation.type);
        var column = contextRelation.from.split(".")[1];
        var sql = "select * from {0} where {1} = '{2}'".format(contextRelation.type, contextRelation.to, parentInstance[column]);
        var baseInstance = JSON.parse(queryMethod(contextRelation)(sql));

        if (!Util.hasValue(baseInstance)) {
            return null;
        }
        if (!Util.hasValue(baseEntity.relations) || baseEntity.relations.length === 0) {
            return baseInstance;
        }
        //TODO: When baseEntity is a list, relatives have to be loaded for each instance
        baseEntity.relations.forEach(function (relation) {
            if (relation.type !== parentType) {
                var relative = loadEntityObjectAndItsRelatives(entitiesDefinition, baseInstance, baseEntity.type, relation);
                if (Util.hasValue(relative)) {
                    baseInstance[relation.type] = relative;
                }
            }
        });
        return baseInstance;
    };

    var queryMethod = function (contextRelation) {
        if (RelationKind[contextRelation.kind] === RelationKind.one_to_many) {
            return FormDataRepository.queryList;
        }
        else {
            return FormDataRepository.queryUniqueResult;
        }
    };

    return {
        loadEntityHierarchy: function (entitiesDefinition, baseEntityType, baseEntityId) {
            var baseEntityDefinition = entitiesDefinition.findEntityDefinitionByType(baseEntityType);
            //TODO : Need to format the sql as per the data type
            var sql = "select * from {0} where id = '{1}'".format(baseEntityType, baseEntityId);
            var baseEntity = JSON.parse(FormDataRepository.queryUniqueResult(sql));
            if (!Util.hasValue(baseEntityDefinition.relations) || baseEntityDefinition.relations.length === 0) {
                var entity = {};
                entity[baseEntityType] = baseEntity;
                return entity;
            }
            baseEntityDefinition.relations.forEach(function (relation) {
                baseEntity[relation.type] = loadEntityObjectAndItsRelatives(entitiesDefinition, baseEntity, baseEntityType, relation);
            });
            var entityWithRelatives = {};
            entityWithRelatives[baseEntityType] = baseEntity;
            return entityWithRelatives;
        }
    };
});
