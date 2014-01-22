define(['Squire', 'AsyncSpec'], function (Squire, AsyncSpec) {
    describe("Form Data Controller:", function () {

        var injector, async = new AsyncSpec(this);
        var formDataController;
        var entityRelationshipLoader;
        var formDefinitionLoader;
        var formModelMapper;
        var formDataRepository;
        var submissionRouter;
        var entityDefinitions;
        var entityRelationships;
        var expectedEntityDefinitions;

        async.beforeEach(function (done) {
            injector = new Squire();
            injector
                .require(['ziggy/EntityRelationshipLoader', 'ziggy/FormDefinitionLoader', 'ziggy/FormDataRepository',
                'ziggy/FormModelMapper', 'ziggy/FormSubmissionRouter', 'ziggy/FormDataController', 'ziggy/EntityDefinitions', 
                'ziggy/EntityRelationships'],
                function (EntityRelationshipLoader, FormDefinitionLoader, FormDataRepository, FormModelMapper, FormSubmissionRouter, FormDataController, EntityDefinitions, EntityRelationships) {
                    entityRelationshipLoader = EntityRelationshipLoader;
                    formDefinitionLoader = FormDefinitionLoader;
                    formDataRepository = FormDataRepository;
                    formModelMapper = FormModelMapper;
                    submissionRouter = FormSubmissionRouter;
                    formDataController = FormDataController;
                    entityDefinitions = EntityDefinitions.newInstance();
                    entityRelationships = EntityRelationships;
                    done();
                });
        });

        async.it("should get form model for given form type when there is no instance id.", function (done) {
            var expectedFormModel = {};
            var formDefinition = {
                "form": {
                }
            };
            var params = {
                "id": "id 1",
                "formName": "entity registration",
                "entityId": "entity 1 id"
            };
            var entityRelationshipJSON = [];
            spyOn(entityRelationshipLoader, 'load').andReturn(entityRelationshipJSON);
            spyOn(formDefinitionLoader, 'load').andReturn(formDefinition);
            spyOn(formModelMapper, 'mapToFormModel').andReturn(expectedFormModel);
            expectedEntityDefinitions =
                entityRelationships.determineEntitiesAndRelations(entityRelationshipJSON, formDefinition);
            spyOn(entityRelationships, 'determineEntitiesAndRelations').andReturn(expectedEntityDefinitions);

            var actualFormModel = formDataController.get(params);

            expect(actualFormModel).toBe(expectedFormModel);
            expect(formDefinitionLoader.load).toHaveBeenCalledWith("entity registration");
            expect(formModelMapper.mapToFormModel).toHaveBeenCalledWith(expectedEntityDefinitions, formDefinition, params);
            done();
        });

        async.it("should save form submission.", function (done) {
            var entityRelationshipJSON = [
                {
                    "parent": "ec",
                    "child": "mother",
                    "field": "wife",
                    "kind": "one_to_one",
                    "from": "ec.id",
                    "to": "mother.ec_id"
                }
            ];
            var formDefinition = {
                form_data_definition_version: "1",
                form: {
                }
            };
            var formModel = {
                form_data_definition_version: "1",
                form: {
                    bind_type: "ec",
                    fields: [
                        {
                            name: "id",
                            source: "ec.id",
                            value: "ec id 1"
                        }
                    ]
                }};
            var params = {};
            spyOn(entityRelationshipLoader, 'load').andReturn(entityRelationshipJSON);
            spyOn(formDefinitionLoader, 'load').andReturn(formDefinition);
            spyOn(formDataRepository, 'saveFormSubmission');
            spyOn(formModelMapper, 'mapToEntityAndSave');
            expectedEntityDefinitions =
                entityRelationships.determineEntitiesAndRelations(entityRelationshipJSON, formDefinition);
            spyOn(entityRelationships, 'determineEntitiesAndRelations').andReturn(expectedEntityDefinitions);

            formDataController.save(params, formModel);

            expect(formDataRepository.saveFormSubmission).toHaveBeenCalledWith(params, formModel, "1");
            expect(formModelMapper.mapToEntityAndSave).toHaveBeenCalledWith(expectedEntityDefinitions, formModel);
            done();
        });

        async.it("should create/update entities.", function (done) {
            var entityRelationshipJSON = [
                {
                    "parent": "ec",
                    "child": "mother",
                    "field": "wife",
                    "kind": "one_to_one",
                    "from": "ec.id",
                    "to": "mother.ec_id"
                }
            ];
            var formDefinition = {
                "form": {
                }
            };
            var formModel = {form: {
                bind_type: "ec",
                fields: [
                    {
                        name: "id",
                        source: "ec.id",
                        value: "ec id 1"
                    }
                ]
            }};
            var params = {instanceId: "instance id 1"};
            spyOn(entityRelationshipLoader, 'load').andReturn(entityRelationshipJSON);
            spyOn(formDefinitionLoader, 'load').andReturn(formDefinition);
            spyOn(formDataRepository, 'saveFormSubmission');
            spyOn(formModelMapper, 'mapToEntityAndSave');
            spyOn(submissionRouter, 'route');
            expectedEntityDefinitions =
                entityRelationships.determineEntitiesAndRelations(entityRelationshipJSON, formDefinition);
            spyOn(entityRelationships, 'determineEntitiesAndRelations').andReturn(expectedEntityDefinitions);


            formDataController.createOrUpdateEntity(params, formModel);

            expect(formDataRepository.saveFormSubmission).not.toHaveBeenCalled();
            expect(formModelMapper.mapToEntityAndSave).toHaveBeenCalledWith(expectedEntityDefinitions, formModel);
            expect(submissionRouter.route).toHaveBeenCalledWith("instance id 1");
            done();
        });

        async.it("should not try to map and save entities when there is no entity defined.", function (done) {
            var entityRelationshipJSON = [];
            var formDefinition = {
                form_data_definition_version: "1",
                form: {
                }
            };
            var formModel = {};
            var params = {};
            spyOn(entityRelationshipLoader, 'load').andReturn(entityRelationshipJSON);
            spyOn(formDefinitionLoader, 'load').andReturn(formDefinition);
            spyOn(formDataRepository, 'saveFormSubmission');
            spyOn(formModelMapper, 'mapToEntityAndSave');

            formDataController.save(params, formModel);

            expect(formDataRepository.saveFormSubmission).toHaveBeenCalledWith(params, formModel, "1");
            expect(formModelMapper.mapToEntityAndSave).not.toHaveBeenCalled();
            done();
        });

        async.it("should add entityId to params from formModel.", function (done) {
            var entityRelationshipJSON = [
                {
                    "parent": "ec",
                    "child": "mother",
                    "field": "wife",
                    "kind": "one_to_one",
                    "from": "ec.id",
                    "to": "mother.ec_id"
                }
            ];
            var formModel = {};
            var formDefinition = {
                "form": {
                }
            };
            var params = {};
            spyOn(entityRelationshipLoader, 'load').andReturn(entityRelationshipJSON);
            spyOn(formDefinitionLoader, 'load').andReturn(formDefinition);
            spyOn(formDataRepository, 'saveFormSubmission');
            spyOn(formModelMapper, 'mapToEntityAndSave').andCallFake(function (entityRelationship, formModel) {
                formModel.form = {};
                formModel.form.bind_type = "ec";
                formModel.form.fields = [
                    {
                        source: "ec.id",
                        value: "ec id 1"
                    }
                ];
            });

            formDataController.save(params, formModel);

            expect(formDataRepository.saveFormSubmission).toHaveBeenCalledWith({"entityId": "ec id 1"}, formModel, "1");
            done();
        });

        async.it("should call router when form submission save succeeds.", function (done) {
            var entityRelationshipJSON = [
                {
                    "parent": "ec",
                    "child": "mother",
                    "field": "wife",
                    "kind": "one_to_one",
                    "from": "ec.id",
                    "to": "mother.ec_id"
                }
            ];
            var formDefinition = {
                "form": {
                }
            };
            var formModel = {};
            var params = {"instanceId": "instance id 1"};
            spyOn(entityRelationshipLoader, 'load').andReturn(entityRelationshipJSON);
            spyOn(formDefinitionLoader, 'load').andReturn(formDefinition);
            spyOn(formDataRepository, 'saveFormSubmission').andReturn("instance id 1");
            spyOn(submissionRouter, 'route');
            spyOn(formModelMapper, 'mapToEntityAndSave').andCallFake(function (entityRelationship, formModel) {
                formModel.form = {};
                formModel.form.bind_type = "ec";
                formModel.form.fields = [
                    {
                        source: "ec.id",
                        value: "ec id 1"
                    }
                ];
            });

            formDataController.save(params, formModel);

            expect(submissionRouter.route).toHaveBeenCalledWith("instance id 1");
            done();
        });

        async.afterEach(function (done) {
            injector.remove();
            done();
        });
    });
});
