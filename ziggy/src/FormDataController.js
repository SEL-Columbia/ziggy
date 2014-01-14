define(['EntityRelationshipLoader', 'FormDefinitionLoader', 'FormModelMapper', 'FormDataRepository',
    'FormSubmissionRouter', 'EntityRelationships', 'Util'],
    function (EntityRelationshipLoader, FormDefinitionLoader, FormModelMapper, FormDataRepository, FormSubmissionRouter, EntityRelationships, Util) {
        "use strict";

        var defaultFormDataDefinitionVersion = "1";
        var entityRelationshipsJsonDefinition;
        var formDefinition;
        var entityDefinitions;

        var init = function (params) {
            if (!Util.hasValue(entityRelationshipsJsonDefinition)) {
                entityRelationshipsJsonDefinition = EntityRelationshipLoader.load();
            }
            //TODO: if entities if null, consider taking bind_type from params, or formName
            if (!Util.hasValue(formDefinition)) {
                formDefinition = FormDefinitionLoader.load(params.formName);
            }
            if (!Util.hasValue(entityDefinitions)) {
                entityDefinitions = EntityRelationships
                    .determineEntitiesAndRelations(entityRelationshipsJsonDefinition, formDefinition);
            }
        };

        var updateEntityAndParams = function (params, data) {
            init(params);
            if (entityDefinitions.hasEntityDefinitions()) {
                FormModelMapper.mapToEntityAndSave(entityDefinitions, data);
                var baseEntityIdField = data.form.fields.filter(function (field) {
                    return field.source === data.form.bind_type + ".id";
                })[0];
                params.entityId = baseEntityIdField.value;
            }
            return params;
        };

        return {
            get: function (params) {
                init(params);
                return FormModelMapper.mapToFormModel(entityDefinitions, formDefinition, params);
            },
            save: function (params, data) {
                if (typeof params !== 'object') {
                    params = JSON.parse(params);
                }
                if (typeof data !== 'object') {
                    data = JSON.parse(data);
                }
                params = updateEntityAndParams(params, data);
                var formSubmissionInstanceId = FormDataRepository
                    .saveFormSubmission(params, data, data.form_data_definition_version || defaultFormDataDefinitionVersion);
                if (Util.hasValue(formSubmissionInstanceId)) {
                    FormSubmissionRouter.route(params.instanceId);
                }
            },
            createOrUpdateEntity: function (params, data) {
                if (typeof params !== 'object') {
                    params = JSON.parse(params);
                }
                if (typeof data !== 'object') {
                    data = JSON.parse(data);
                }
                params = updateEntityAndParams(params, data);
                FormSubmissionRouter.route(params.instanceId);
            },
            deleteFormSubmission: function (params) {
                init(params);
                //dataSource.remove(instanceId);
            }
        };
    });