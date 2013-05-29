if (typeof enketo === "undefined" || !enketo) {
    var enketo = {};
}

enketo.FormModelMapper = function (formDataRepository, queryBuilder, idFactory) {
    "use strict";

    var findEntityByType = function (entities, type) {
        for (var index = 0; index < entities.length; index++) {
            if (entities[index].type === type) {
                return entities[index];
            }
        }
        return null;
    };

    var findEntitiesByType = function (entities, type) {
        return entities.filter(function (entity) {
            return entity.type === type;
        });
    };

    var findEntityByTypeAndId = function (entities, entity) {
        for (var index = 0; index < entities.length; index++) {
            if (entities[index].type === entity.type &&
                entities[index].getFieldByPersistenceName("id").value === entity.getFieldByPersistenceName("id").value) {
                return entities[index];
            }
        }
        return null;
    };

    var addFieldToEntityInstance = function (source, value, entityInstance) {
        var pathVariables = source.split(".");
        var base = pathVariables[0];
        if (!enketo.hasValue(entityInstance[base])) {
            entityInstance[base] = {};
        }
        if (pathVariables.length > 2) {
            pathVariables.shift();
            entityInstance[base] = addFieldToEntityInstance(pathVariables.join("."), value, entityInstance[base]);
        } else {
            entityInstance[base][pathVariables[1]] = value;
        }
        return entityInstance;
    };

    var shouldPersistEntity = function (entitiesToSave, entity, updatedEntities) {
        if (!enketo.hasValue(entity)) {
            return false;
        }
        var entityToBeSaved = findEntityByTypeAndId(entitiesToSave, entity);
        var isEntityAlreadySaved = enketo.hasValue(findEntityByTypeAndId(updatedEntities, entity));
        return enketo.hasValue(entityToBeSaved) && !isEntityAlreadySaved;
    };

    var addParentReferenceFieldToChildEntity = function (childRelation, entitiesToSave, parentId, childEntity) {
        var parentReferenceField = childRelation.to.split(".")[1];
        var childEntityToSave = findEntityByTypeAndId(entitiesToSave, childEntity);

        childEntityToSave.createField(
            childEntityToSave.source + "." + parentReferenceField,
            childEntityToSave.source + "." + parentReferenceField,
            parentReferenceField,
            parentId
        );
    };

    var addIdValueToFormModel = function (formModel, idField) {
        var idFormField = formModel.form.fields.filter(function (formField) {
            return formField.source === idField.source;
        })[0];
        if (!enketo.hasValue(idFormField)) {
            formModel.form.fields.push(idField);
        }
        else if (!enketo.hasValue(idFormField.value)) {
            idFormField.value = idField.value;
        }
    };

    var identify = function (entitiesToSave, formModel) {
        entitiesToSave.forEach(function (entity) {
            var idField = entity.getFieldByPersistenceName("id");
            if (!enketo.hasValue(idField)) {
                idField = {
                    "name": entity.source + ".id",
                    "source": entity.source + ".id",
                    "persistenceName": "id",
                    "value": idFactory.generateIdFor(entity.type)
                };
                entity.addField(idField);
                addIdValueToFormModel(formModel, idField);
            }
            else if (!enketo.hasValue(idField.value)) {
                idField.value = idFactory.generateIdFor(entity.type);
                addIdValueToFormModel(formModel, idField);
            }
        });
    };

    var persist = function (entitiesDef, entity, entitiesToSave, updatedEntities) {
        var parentRelations = entity.findParents();
        parentRelations.forEach(function (parentRelation) {
            if (shouldPersistEntity(entitiesToSave, findEntityByType(entitiesToSave, parentRelation.type), updatedEntities)) {
                persist(entitiesDef, findEntityByType(entitiesToSave, parentRelation.type), entitiesToSave, updatedEntities);
            }
        });

        var entityId;
        if (shouldPersistEntity(entitiesToSave, entity, updatedEntities)) {
            var entityFields = {};
            entity.iterateThroughFields(function (field) {
                entityFields[field.persistenceName] = field.value;
            });
            formDataRepository.saveEntity(entity.type, entityFields);
            entityId = entity.getFieldByPersistenceName("id").value;
            updatedEntities.push(entity);
        }

        var childRelations = entity.findChildren();
        childRelations.forEach(function (childRelation) {
            if (childRelation.kind === enketo.RelationKind.one_to_many.type) {
                var childEntities = findEntitiesByType(entitiesToSave, childRelation.type);
                childEntities.forEach(function (childEntity) {
                    if (shouldPersistEntity(entitiesToSave, childEntity, updatedEntities)) {
                        addParentReferenceFieldToChildEntity(childRelation, entitiesToSave, entityId, childEntity);
                        persist(entitiesDef, childEntity, entitiesToSave, updatedEntities);
                    }
                });
            }
            else {
                var childEntity = findEntityByType(entitiesToSave, childRelation.type);
                if (shouldPersistEntity(entitiesToSave, childEntity, updatedEntities)) {
                    addParentReferenceFieldToChildEntity(childRelation, entitiesToSave, entityId, childEntity);
                    persist(entitiesDef, childEntity, entitiesToSave, updatedEntities);
                }
            }
        });
    };

    var getValueFromHierarchyByPath = function (entityHierarchy, pathVariables) {
        var value = entityHierarchy;
        for (var index = 0; index < pathVariables.length; index++) {
            var pathVariable = pathVariables[index];
            if (enketo.hasValue(value[pathVariable])) {
                value = value[pathVariable];
            } else {
                value = undefined;
                break;
            }
        }
        return value;
    };

    var mapFieldValues = function (formDefinition, entityHierarchy) {
        formDefinition.form.fields.forEach(function (field) {
            var pathVariables = field.source.split(".");
            var fieldValue = getValueFromHierarchyByPath(entityHierarchy, pathVariables);
            if (enketo.hasValue(fieldValue)) {
                field.value = fieldValue;
            }
        });
    };

    var findPathToBaseEntityFromSubEntity = function (entitiesDefinition, baseEntityType, entityType) {
        var currentEntityDefinition = entitiesDefinition.filter(function (entityDefinition) {
            return entityDefinition.type === entityType;
        })[0];
        var baseEntityRelation = currentEntityDefinition.getRelationByType(baseEntityType);
        if (enketo.hasValue(baseEntityRelation)) {
            return [baseEntityRelation.type, entityType];
        }
        for (var index = 0; index < currentEntityDefinition.relations.length; index++) {
            var path = findPathToBaseEntityFromSubEntity(entitiesDefinition, baseEntityType, currentEntityDefinition.relations[index].type);
            if (enketo.hasValue(path)) {
                path.push(entityType);
                return path;
            }
        }
        return null;
    };

    var mapFieldValuesForSubForms = function (formDefinition, entitiesDefinition, entityHierarchy) {
        if (enketo.hasValue(formDefinition.form.sub_forms)) {
            formDefinition.form.sub_forms.forEach(function (subForm) {
                addSourceToFields(subForm.fields, subForm.bind_type);
                var path = findPathToBaseEntityFromSubEntity(entitiesDefinition, formDefinition.form.bind_type, subForm.bind_type);
                var subEntities = getValueFromHierarchyByPath(entityHierarchy, path);
                subForm.instances = [];
                subEntities.forEach(function (subEntity) {
                    var subEntityInstance = null;
                    subForm.fields.forEach(function (field) {
                        var value = getValueFromHierarchyByPath(subEntity, field.source.split(".").slice(-1));
                        if (enketo.hasValue(value)) {
                            subEntityInstance = (subEntityInstance || {});
                            subEntityInstance[field.name] = value;
                        }
                    });
                    if (enketo.hasValue(subEntityInstance)) {
                        subForm.instances.push(subEntityInstance);
                    }
                });
            });
        }
    };

    var addSourceToFields = function (fields, bindType) {
        fields.forEach(function (field) {
            if (!enketo.hasValue(field.source)) {
                field.source = bindType + "." + field.name;
            }
        });
    };

    return {
        mapToFormModel: function (entitiesDefinition, formDefinition, params) {
            //TODO: Handle errors, savedFormInstance could be null!
            var savedFormInstance = JSON.parse(formDataRepository.getFormInstanceByFormTypeAndId(params.id, params.formName));
            if (enketo.hasValue(savedFormInstance)) {
                return savedFormInstance;
            }
            if (!enketo.hasValue(entitiesDefinition)) {
                return formDefinition;
            }
            addSourceToFields(formDefinition.form.fields, formDefinition.form.bind_type);
            //TODO: not every case entityId maybe applicable.
            if (!enketo.hasValue(params.entityId)) {
                return formDefinition;
            }
            //TODO: pass all the params to the query builder and let it decide what it wants to use for querying.
            var entityHierarchy = queryBuilder.loadEntityHierarchy(entitiesDefinition, formDefinition.form.bind_type, params.entityId);
            mapFieldValues(formDefinition, entityHierarchy);
            mapFieldValuesForSubForms(formDefinition, entitiesDefinition, entityHierarchy);
            return formDefinition;
        },
        mapToEntityAndSave: function (entitiesDef, formModel) {
            var entitiesToSave = [];
            formModel.form.fields.forEach(function (field) {
                var pathVariables = field.source.split(".");
                var entityTypeOfField = pathVariables[pathVariables.length - 2];
                var entityInstance = findEntityByType(entitiesToSave, entityTypeOfField);
                if (!enketo.hasValue(entityInstance)) {
                    entityInstance = findEntityByType(entitiesDef, entityTypeOfField).createInstance();
                    entityInstance.source = field.source.substring(0, field.source.lastIndexOf("."));
                    entitiesToSave.push(entityInstance);
                }
                entityInstance.createField(field.name, field.source, pathVariables[pathVariables.length - 1], field.value);
            });
            var subEntitiesToSave = [];
            if (enketo.hasValue(formModel.form.sub_forms)) {
                formModel.form.sub_forms.forEach(function (subForm) {
                    subForm.instances.forEach(function (instance) {
                        var subEntityInstance = findEntityByType(entitiesDef, subForm.bind_type).createInstance();
                        subForm.fields.forEach(function (field) {
                            var pathVariables = field.source.split(".");
                            subEntityInstance.createField(field.name, field.source, pathVariables[pathVariables.length - 1], instance[field.name]);
                        });
                        subEntityInstance.source = subForm.bind_type;
                        subEntitiesToSave.push(subEntityInstance);
                    });
                });
            }
            identify(entitiesToSave, formModel);
            identify(subEntitiesToSave, formModel);
            entitiesToSave = entitiesToSave.concat(subEntitiesToSave);
            var updatedEntities = [];
            persist(entitiesDef, findEntityByType(entitiesToSave, formModel.form.bind_type), entitiesToSave, updatedEntities);
        }
    };
};