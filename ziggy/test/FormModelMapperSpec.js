define(['Squire', 'AsyncSpec'], function (Squire, AsyncSpec) {
    describe("Form Model Mapper:", function () {

        var injector, async = new AsyncSpec(this);
        var formModelMapper;
        var FormDataRepository;
        var formDefinition;
        var subFormDefinition;
        var savedFormInstance;
        var queryBuilder;
        var entitiesDef;
        var idFactory;

        async.beforeEach(function (done) {
            injector = new Squire();
            injector
                .require(['EntityDefinitions', 'EntityDef', 'RelationDef', 'FormDataRepository', 'SqlQueryBuilder', 'IdFactory', 'FormModelMapper'],
                function (EntityDefinitions, EntityDef, RelationDef, FormDataRepository, SqlQueryBuilder, IdFactory, FormModelMapper) {
                    savedFormInstance = JSON.stringify({
                        "form": {
                            "bind_type": "entity",
                            "default_bind_path": "/Entity registration/",
                            "fields": [
                                {
                                    "name": "field1",
                                    "value": "field1_value"
                                },
                                {
                                    "name": "field2",
                                    "bind": "field2_bind"
                                },
                                {
                                    "name": "field3",
                                    "bind": "field3_bind",
                                    "source": "entity.field3_source",
                                    "value": "field3_value"
                                }
                            ]
                        }
                    });
                    formDefinition = {
                        "form": {
                            "bind_type": "entity",
                            "default_bind_path": "/Entity registration/",
                            "fields": [
                                {
                                    "name": "field1"
                                },
                                {
                                    "name": "field2",
                                    "bind": "field2_bind"
                                },
                                {
                                    "name": "field3",
                                    "bind": "field3_bind",
                                    "source": "entity.field3_source"
                                }
                            ]
                        }
                    };
                    entitiesDef = EntityDefinitions.newInstance()
                        .add(EntityDef.newInstance(
                                "ec").addRelation(RelationDef.newInstance(
                                "mother",
                                "one_to_one",
                                "parent",
                                "ec.id",
                                "mother.ec_id")))
                        .add(EntityDef.newInstance(
                                "mother").addRelation(RelationDef.newInstance(
                                "ec",
                                "one_to_one",
                                "child",
                                "mother.ec_id",
                                "ec.id")).addRelation(RelationDef.newInstance(
                                "child",
                                "one_to_many",
                                "parent",
                                "mother.id",
                                "child.mother_id")))
                        .add(EntityDef.newInstance(
                                "child").addRelation(RelationDef.newInstance(
                                "mother",
                                "many_to_one",
                                "child",
                                "child.mother_id",
                                "mother.id")));
                    formDataRepository = FormDataRepository;
                    queryBuilder = SqlQueryBuilder;
                    idFactory = IdFactory;
                    formModelMapper = FormModelMapper;
                    done();
                });
        });

        async.it("should get form model for a given form type from the saved form instance when it exists", function (done) {
            injector
                .require(['EntityDefinitions'],
                function (EntityDefinitions) {
                    spyOn(formDataRepository, 'getFormInstanceByFormTypeAndId').andReturn(savedFormInstance);
                    var entities = EntityDefinitions.newInstance();
                    var params = {
                        "id": "id 1",
                        "formName": "entity-registration"
                    };

                    var formModel = formModelMapper.mapToFormModel(entities, formDefinition, params);

                    expect(JSON.stringify(formModel)).toBe(savedFormInstance);
                    expect(formDataRepository.getFormInstanceByFormTypeAndId).toHaveBeenCalledWith(params.id, params.formName);
                    done();
                });
        });

        async.it("should get form model with empty field values for a given form type when there is no saved form instance and no entity", function (done) {
            injector
                .require(['EntityDefinitions'],
                function (EntityDefinitions) {
                    spyOn(formDataRepository, 'getFormInstanceByFormTypeAndId').andReturn(null);
                    var entities = EntityDefinitions.newInstance();
                    var params = {
                        "id": "id 1",
                        "formName": "entity-registration"
                    };

                    var formModel = formModelMapper.mapToFormModel(entities, formDefinition, params);

                    expect(formModel).toBe(formDefinition);
                    done();
                });
        });

        async.it("should get form model with empty field values for a given form type when there is no saved form instance, no entity but entity relationship exists",
            function (done) {
                injector
                    .require(['EntityDefinitions'],
                    function (EntityDefinitions) {
                        var expectedFormDataDefinition = {
                            "form": {
                                "bind_type": "entity",
                                "default_bind_path": "/Entity registration/",
                                "fields": [
                                    {
                                        "name": "field1",
                                        "source": "entity.field1"
                                    },
                                    {
                                        "name": "field2",
                                        "bind": "field2_bind",
                                        "source": "entity.field2"
                                    },
                                    {
                                        "name": "field3",
                                        "bind": "field3_bind",
                                        "source": "entity.field3_source"
                                    }
                                ]
                            }
                        };
                        spyOn(formDataRepository, 'getFormInstanceByFormTypeAndId').andReturn(null);
                        var entities = EntityDefinitions.newInstance();
                        var params = {
                            "id": "id 1",
                            "formName": "entity-registration",
                            "entityId": ""
                        };

                        var formModel = formModelMapper.mapToFormModel(entities, formDefinition, params);

                        expect(formModel).toEqual(expectedFormDataDefinition);
                        done();
                    });
            });

        async.it("should get form model with empty field values for a given form type when there is no saved form instance, only one entity",
            function (done) {
                injector
                    .require(['EntityDefinitions', 'EntityDef'],
                    function (EntityDefinitions, EntityDef) {
                        formDefinition = {
                            "form": {
                                "bind_type": "entity",
                                "default_bind_path": "/Entity registration/",
                                "fields": [
                                    {
                                        "name": "field1",
                                        "shouldLoadValue": true
                                    },
                                    {
                                        "name": "field2",
                                        "bind": "field2_bind",
                                        "shouldLoadValue": true
                                    },
                                    {
                                        "name": "field3",
                                        "bind": "field3_bind",
                                        "source": "entity.field3_source"
                                    }
                                ]
                            }
                        };
                        var expectedFormDataDefinition = {
                            "form": {
                                "bind_type": "entity",
                                "default_bind_path": "/Entity registration/",
                                "fields": [
                                    {
                                        "name": "field1",
                                        "source": "entity.field1",
                                        "shouldLoadValue": true,
                                        "value": "value1"

                                    },
                                    {
                                        "name": "field2",
                                        "bind": "field2_bind",
                                        "source": "entity.field2",
                                        "shouldLoadValue": true,
                                        "value": "value2"

                                    },
                                    {
                                        "name": "field3",
                                        "bind": "field3_bind",
                                        "source": "entity.field3_source"
                                    }
                                ]
                            }
                        };
                        var entityValues = {
                            entity: {
                                field1: "value1",
                                field2: "value2"
                            }
                        };

                        spyOn(formDataRepository, 'getFormInstanceByFormTypeAndId').andReturn(null);
                        spyOn(queryBuilder, 'loadEntityHierarchy').andReturn(entityValues);

                        var entities = EntityDefinitions.newInstance().add(EntityDef.newInstance("entity"));
                        var params = {
                            "id": "id 1",
                            "formName": "entity-registration",
                            "entityId": "123"
                        };

                        var formModel = formModelMapper.mapToFormModel(entities, formDefinition, params);

                        expect(formModel).toEqual(expectedFormDataDefinition);
                        done();
                    });
            });

        async.it("should get form model with values loaded from an entity for a given form type when entity exists", function (done) {
            injector
                .require(['EntityDefinitions'],
                function (EntityDefinitions) {
                    var entityValues = {
                        entity: {
                            field1: "value1",
                            field2: "value2",
                            childEntity: {
                                field3: "value3",
                                grandChildEntity: {
                                    field4: "value4"
                                }
                            }
                        }
                    };
                    var entities = EntityDefinitions.newInstance();
                    var params = {
                        "id": "id 1",
                        "formName": "entity-registration",
                        "entityId": "123"
                    };
                    formDefinition = {
                        "form": {
                            "bind_type": "entity",
                            "default_bind_path": "/Entity registration/",
                            "fields": [
                                {
                                    "name": "field1",
                                    "shouldLoadValue": true
                                },
                                {
                                    "name": "field2",
                                    "bind": "field2_bind",
                                    "shouldLoadValue": true
                                },
                                {
                                    "name": "field3",
                                    "bind": "field3_bind",
                                    "source": "entity.childEntity.field3",
                                    "shouldLoadValue": true
                                },
                                {
                                    "name": "field4",
                                    "bind": "field4_bind",
                                    "source": "entity.childEntity.grandChildEntity.field4",
                                    "shouldLoadValue": true
                                },
                                {
                                    "name": "field5",
                                    "bind": "field4_bind",
                                    "source": "entity.childEntity.field5",
                                    "shouldLoadValue": true
                                },
                                {
                                    "name": "previousFPMethod",
                                    "source": "entity.field1",
                                    "shouldLoadValue": true
                                }
                            ]
                        }
                    };
                    var expectedFormModel = {
                        "form": {
                            "bind_type": "entity",
                            "default_bind_path": "/Entity registration/",
                            "fields": [
                                {
                                    "name": "field1",
                                    "source": "entity.field1",
                                    "shouldLoadValue": true,
                                    "value": "value1"
                                },
                                {
                                    "name": "field2",
                                    "bind": "field2_bind",
                                    "source": "entity.field2",
                                    "shouldLoadValue": true,
                                    "value": "value2"
                                },
                                {
                                    "name": "field3",
                                    "bind": "field3_bind",
                                    "source": "entity.childEntity.field3",
                                    "shouldLoadValue": true,
                                    "value": "value3"
                                },
                                {
                                    "name": "field4",
                                    "bind": "field4_bind",
                                    "source": "entity.childEntity.grandChildEntity.field4",
                                    "shouldLoadValue": true,
                                    "value": "value4"
                                },
                                {
                                    "name": "field5",
                                    "bind": "field4_bind",
                                    "source": "entity.childEntity.field5",
                                    "shouldLoadValue": true
                                },
                                {
                                    "name": "previousFPMethod",
                                    "source": "entity.field1",
                                    "shouldLoadValue": true,
                                    "value": "value1"
                                }
                            ]
                        }
                    };
                    spyOn(formDataRepository, 'getFormInstanceByFormTypeAndId').andReturn(null);
                    spyOn(queryBuilder, 'loadEntityHierarchy').andReturn(entityValues);

                    var formModel = formModelMapper.mapToFormModel(entities, formDefinition, params);

                    expect(formModel).toEqual(expectedFormModel);
                    expect(queryBuilder.loadEntityHierarchy).toHaveBeenCalledWith(entities, "entity", "123");
                    done();
                });
        });

        async.it("should map form model into entities and save self, child and grand child.", function (done) {
            var formModel = {
                "form": {
                    "bind_type": "ec",
                    "default_bind_path": "/EC registration/",
                    "fields": [
                        {
                            "name": "id",
                            "source": "ec.id"
                        },
                        {
                            "name": "field2",
                            "source": "ec.field2",
                            "bind": "field2_bind",
                            "value": "value2"
                        },
                        {
                            "name": "field3",
                            "bind": "field3_bind",
                            "source": "ec.mother.field3",
                            "value": "value3"
                        },
                        {
                            "name": "field4",
                            "bind": "field4_bind",
                            "source": "ec.mother.child.field4",
                            "value": "value4"
                        },
                        {
                            "name": "field5",
                            "bind": "field5_bind",
                            "source": "ec.mother.field5",
                            "value": "value5"
                        },
                        {
                            "name": "field6",
                            "bind": "field6_bind",
                            "source": "ec.field6",
                            "value": "value6"
                        }
                    ]
                }
            };
            var expectedECInstance = {
                "id": "new uuid : ec",
                "field2": "value2",
                "field6": "value6"
            };
            var expectedMotherInstance = {
                "field3": "value3",
                "field5": "value5",
                "id": "new uuid : mother",
                "ec_id": "new uuid : ec"
            };
            var expectedChildInstance = {
                "field4": "value4",
                "id": "new uuid : child",
                "mother_id": "new uuid : mother"
            };
            spyOn(formDataRepository, "saveEntity");
            spyOn(idFactory, 'generateIdFor').andCallFake(function (entityType) {
                return "new uuid : " + entityType;
            });

            formModelMapper.mapToEntityAndSave(entitiesDef, formModel);

            expect(formDataRepository.saveEntity).toHaveBeenCalledWith("ec", expectedECInstance);
            expect(formDataRepository.saveEntity).toHaveBeenCalledWith("mother", expectedMotherInstance);
            expect(formDataRepository.saveEntity).toHaveBeenCalledWith("child", expectedChildInstance);
            var motherId = formModel.form.fields.filter(function (field) {
                return field.source === "ec.mother.id";
            })[0];
            expect(motherId).toBeDefined();
            expect(motherId.value).not.toBeNull();
            var ecId = formModel.form.fields.filter(function (field) {
                return field.source === "ec.id";
            })[0];
            expect(ecId.value).toBe("new uuid : ec");
            done();
        });

        async.it("should map form model into entities and save self, parent and child.", function (done) {
            var formModel = {
                "form": {
                    "bind_type": "mother",
                    "default_bind_path": "/Mother registration/",
                    "fields": [
                        {
                            "name": "id",
                            "source": "mother.id",
                            "value": "mother id 1"
                        },
                        {
                            "name": "field2",
                            "source": "mother.field2",
                            "bind": "field2_bind",
                            "value": "value2"
                        },
                        {
                            "name": "field3",
                            "bind": "field3_bind",
                            "source": "mother.ec.field3",
                            "value": "value3"
                        },
                        {
                            "name": "field4",
                            "bind": "field4_bind",
                            "source": "mother.child.field4",
                            "value": "value4"
                        },
                        {
                            "name": "field5",
                            "bind": "field5_bind",
                            "source": "mother.ec.field5",
                            "value": "value5"
                        },
                        {
                            "name": "field6",
                            "bind": "field6_bind",
                            "source": "mother.field6",
                            "value": "value6"
                        }
                    ]
                }
            };
            var expectedECInstance = {
                "field3": "value3",
                "field5": "value5",
                "id": "new uuid : ec"
            };
            var expectedMotherInstance = {
                "id": "mother id 1",
                "field2": "value2",
                "field6": "value6",
                "ec_id": "new uuid : ec"
            };
            var expectedChildInstance = {
                "field4": "value4",
                "id": "new uuid : child",
                "mother_id": "mother id 1"
            };
            spyOn(formDataRepository, "saveEntity");
            spyOn(idFactory, 'generateIdFor').andCallFake(function (entityType) {
                return "new uuid : " + entityType;
            });

            formModelMapper.mapToEntityAndSave(entitiesDef, formModel);

            expect(formDataRepository.saveEntity).toHaveBeenCalledWith("ec", expectedECInstance);
            expect(formDataRepository.saveEntity).toHaveBeenCalledWith("mother", expectedMotherInstance);
            expect(formDataRepository.saveEntity).toHaveBeenCalledWith("child", expectedChildInstance);
            done();
        });

        async.it("should map form model into entities and save self, parent and grand parent.", function (done) {
            var formModel = {
                "form": {
                    "bind_type": "child",
                    "default_bind_path": "/Child immunization/",
                    "fields": [
                        {
                            "name": "id",
                            "source": "child.id",
                            "value": ""
                        },
                        {
                            "name": "field2",
                            "source": "child.mother.field2",
                            "bind": "field2_bind",
                            "value": "value2"
                        },
                        {
                            "name": "field3",
                            "bind": "field3_bind",
                            "source": "child.mother.ec.field3",
                            "value": "value3"
                        },
                        {
                            "name": "field4",
                            "bind": "field4_bind",
                            "source": "child.field4",
                            "value": "value4"
                        },
                        {
                            "name": "field5",
                            "bind": "field5_bind",
                            "source": "child.mother.ec.field5",
                            "value": "value5"
                        },
                        {
                            "name": "field6",
                            "bind": "field6_bind",
                            "source": "child.field6",
                            "value": "value6"
                        }
                    ]
                }
            };
            var expectedECInstance = {
                "field3": "value3",
                "field5": "value5",
                "id": "new uuid : ec"
            };
            var expectedMotherInstance = {
                "field2": "value2",
                "id": "new uuid : mother",
                "ec_id": "new uuid : ec"
            };
            var expectedChildInstance = {
                "field4": "value4",
                "field6": "value6",
                "mother_id": "new uuid : mother",
                "id": "new uuid : child"
            };
            spyOn(formDataRepository, "saveEntity");
            spyOn(idFactory, 'generateIdFor').andCallFake(function (entityType) {
                return "new uuid : " + entityType;
            });

            formModelMapper.mapToEntityAndSave(entitiesDef, formModel);

            expect(formDataRepository.saveEntity).toHaveBeenCalledWith("ec", expectedECInstance);
            expect(formDataRepository.saveEntity).toHaveBeenCalledWith("mother", expectedMotherInstance);
            expect(formDataRepository.saveEntity).toHaveBeenCalledWith("child", expectedChildInstance);
            done();
        });

        async.it("should not load values for fields not marked with shouldLoadValue as true", function (done) {
            injector
                .require(['EntityDefinitions'],
                function (EntityDefinitions) {
                    var entityValues = {
                        entity: {
                            field1: "value1",
                            field2: "value2",
                            childEntity: {
                                field3: "value3",
                                grandChildEntity: {
                                    field4: "value4"
                                }
                            }
                        }
                    };
                    var entities = EntityDefinitions.newInstance();
                    var params = {
                        "id": "id 1",
                        "formName": "entity-registration",
                        "entityId": "123"
                    };
                    formDefinition = {
                        "form": {
                            "bind_type": "entity",
                            "default_bind_path": "/Entity registration/",
                            "fields": [
                                {
                                    "name": "field1",
                                    "shouldLoadValue": true
                                },
                                {
                                    "name": "field2",
                                    "bind": "field2_bind"
                                },
                                {
                                    "name": "field3",
                                    "bind": "field3_bind",
                                    "source": "entity.childEntity.field3",
                                    "shouldLoadValue": true
                                },
                                {
                                    "name": "field4",
                                    "bind": "field4_bind",
                                    "source": "entity.childEntity.grandChildEntity.field4",
                                    "shouldLoadValue": true
                                },
                                {
                                    "name": "field5",
                                    "bind": "field4_bind",
                                    "source": "entity.childEntity.field5",
                                    "shouldLoadValue": true
                                },
                                {
                                    "name": "previousFPMethod",
                                    "source": "entity.field1",
                                    "shouldLoadValue": true
                                }
                            ]
                        }
                    };
                    var expectedFormModel = {
                        "form": {
                            "bind_type": "entity",
                            "default_bind_path": "/Entity registration/",
                            "fields": [
                                {
                                    "name": "field1",
                                    "source": "entity.field1",
                                    "shouldLoadValue": true,
                                    "value": "value1"
                                },
                                {
                                    "name": "field2",
                                    "bind": "field2_bind",
                                    "source": "entity.field2"
                                },
                                {
                                    "name": "field3",
                                    "bind": "field3_bind",
                                    "source": "entity.childEntity.field3",
                                    "shouldLoadValue": true,
                                    "value": "value3"
                                },
                                {
                                    "name": "field4",
                                    "bind": "field4_bind",
                                    "source": "entity.childEntity.grandChildEntity.field4",
                                    "shouldLoadValue": true,
                                    "value": "value4"
                                },
                                {
                                    "name": "field5",
                                    "bind": "field4_bind",
                                    "source": "entity.childEntity.field5",
                                    "shouldLoadValue": true
                                },
                                {
                                    "name": "previousFPMethod",
                                    "source": "entity.field1",
                                    "shouldLoadValue": true,
                                    "value": "value1"
                                }
                            ]
                        }
                    };
                    spyOn(formDataRepository, 'getFormInstanceByFormTypeAndId').andReturn(null);
                    spyOn(queryBuilder, 'loadEntityHierarchy').andReturn(entityValues);

                    var formModel = formModelMapper.mapToFormModel(entities, formDefinition, params);

                    expect(formModel).toEqual(expectedFormModel);
                    expect(queryBuilder.loadEntityHierarchy).toHaveBeenCalledWith(entities, "entity", "123");
                    done();
                })

        });

        describe("Sub form mapper:", function () {
            async.it("should create empty instances when there are no sub entities", function (done) {
                var entityValues = {
                    mother: {
                        field1: "value1",
                        child: []
                    }
                };
                var params = {
                    "id": "id 1",
                    "formName": "entity-registration",
                    "entityId": "123"
                };
                subFormDefinition = {
                    "form": {
                        "bind_type": "mother",
                        "default_bind_path": "/Child Entity registration/",
                        "fields": [
                            {
                                "name": "field1",
                                "shouldLoadValue": true
                            }
                        ],
                        "sub_forms": [
                            {
                                "bind_type": "child",
                                "default_bind_path": "/Child Entity registration/Child Registration Entity Group",
                                "fields": [
                                    {
                                        "name": "field2",
                                        "shouldLoadValue": true
                                    },
                                    {
                                        "name": "field3",
                                        "shouldLoadValue": true
                                    },
                                    {
                                        "name": "field4",
                                        "shouldLoadValue": true
                                    }
                                ]
                            }
                        ]
                    }
                };
                var expectedFormModel = {
                    "form": {
                        "bind_type": "mother",
                        "default_bind_path": "/Child Entity registration/",
                        "fields": [
                            {
                                "name": "field1",
                                "shouldLoadValue": true,
                                "source": "mother.field1",
                                "value": "value1"
                            }
                        ],
                        "sub_forms": [
                            {
                                "bind_type": "child",
                                "default_bind_path": "/Child Entity registration/Child Registration Entity Group",
                                "fields": [
                                    {
                                        "name": "field2",
                                        "shouldLoadValue": true,
                                        "source": "child.field2"

                                    },
                                    {
                                        "name": "field3",
                                        "shouldLoadValue": true,
                                        "source": "child.field3"
                                    },
                                    {
                                        "name": "field4",
                                        "shouldLoadValue": true,
                                        "source": "child.field4"
                                    }
                                ],
                                "instances": []
                            }
                        ]

                    }
                };
                spyOn(formDataRepository, 'getFormInstanceByFormTypeAndId').andReturn(null);
                spyOn(queryBuilder, 'loadEntityHierarchy').andReturn(entityValues);

                var formModel = formModelMapper.mapToFormModel(entitiesDef, subFormDefinition, params);

                expect(formModel).toEqual(expectedFormModel);
                expect(queryBuilder.loadEntityHierarchy).toHaveBeenCalledWith(entitiesDef, "mother", "123");
                done();
            });

            async.it("should add empty instance list and source to all sub-form fields even when there is no entity id", function (done) {
                var params = {
                    "id": "id 1",
                    "formName": "entity-registration"
                };
                subFormDefinition = {
                    "form": {
                        "bind_type": "mother",
                        "default_bind_path": "/Child Entity registration/",
                        "fields": [
                            {
                                "name": "field1"
                            }
                        ],
                        "sub_forms": [
                            {
                                "bind_type": "child",
                                "default_bind_path": "/Child Entity registration/Child Registration Entity Group",
                                "fields": [
                                    {
                                        "name": "field2"
                                    },
                                    {
                                        "name": "field3"
                                    },
                                    {
                                        "name": "field4"
                                    }
                                ]
                            }
                        ]
                    }
                };
                var expectedFormModel = {
                    "form": {
                        "bind_type": "mother",
                        "default_bind_path": "/Child Entity registration/",
                        "fields": [
                            {
                                "name": "field1",
                                "source": "mother.field1"
                            }
                        ],
                        "sub_forms": [
                            {
                                "bind_type": "child",
                                "default_bind_path": "/Child Entity registration/Child Registration Entity Group",
                                "fields": [
                                    {
                                        "name": "field2",
                                        "source": "child.field2"
                                    },
                                    {
                                        "name": "field3",
                                        "source": "child.field3"
                                    },
                                    {
                                        "name": "field4",
                                        "source": "child.field4"
                                    }
                                ],
                                "instances": []
                            }
                        ]

                    }
                };
                spyOn(formDataRepository, 'getFormInstanceByFormTypeAndId').andReturn(null);

                var formModel = formModelMapper.mapToFormModel(entitiesDef, subFormDefinition, params);

                expect(formModel).toEqual(expectedFormModel);
                done();
            });

            async.it("should create instances when there are sub entities", function (done) {
                var entityValues = {
                    ec: {
                        field5: "value5",
                        mother: {
                            field1: "value1",
                            child: [
                                {
                                    field2_source: "value1.2",
                                    field3_source: "value1.3",
                                    field4: "value1.4",
                                    field5: "value1.5"
                                },
                                {
                                    field2_source: "value2.2",
                                    field3_source: "value2.3",
                                    field4: "value2.4",
                                    field5: "value2.5"
                                }
                            ]
                        }
                    }
                };
                var params = {
                    "id": "id 1",
                    "formName": "entity-registration",
                    "entityId": "123"
                };
                subFormDefinition = {
                    "form": {
                        "bind_type": "ec",
                        "default_bind_path": "/Child Entity registration/",
                        "fields": [
                            {
                                "name": "field5",
                                "shouldLoadValue": true
                            }
                        ],
                        "sub_forms": [
                            {
                                "bind_type": "child",
                                "default_bind_path": "/Child Entity registration/Child Registration Entity Group",
                                "fields": [
                                    {
                                        "name": "field2",
                                        "source": "child.field2_source",
                                        "bind": "/Child Entity registration/Child Registration Entity Group/field2_bind",
                                        "shouldLoadValue": true
                                    },
                                    {
                                        "name": "field3",
                                        "source": "child.field3_source",
                                        "shouldLoadValue": true
                                    },
                                    {
                                        "name": "field4",
                                        "shouldLoadValue": true
                                    },
                                    {
                                        "name": "field5"
                                    }
                                ]
                            }
                        ]
                    }
                };
                var expectedFormModel = {
                    "form": {
                        "bind_type": "ec",
                        "default_bind_path": "/Child Entity registration/",
                        "fields": [
                            {
                                "name": "field5",
                                "shouldLoadValue": true,
                                "source": "ec.field5",
                                "value": "value5"
                            }
                        ],
                        "sub_forms": [
                            {
                                "bind_type": "child",
                                "default_bind_path": "/Child Entity registration/Child Registration Entity Group",
                                "fields": [
                                    {
                                        "name": "field2",
                                        "source": "child.field2_source",
                                        "bind": "/Child Entity registration/Child Registration Entity Group/field2_bind",
                                        "shouldLoadValue": true
                                    },
                                    {
                                        "name": "field3",
                                        "source": "child.field3_source",
                                        "shouldLoadValue": true
                                    },
                                    {
                                        "name": "field4",
                                        "shouldLoadValue": true,
                                        "source": "child.field4"
                                    },
                                    {
                                        "name": "field5",
                                        "source": "child.field5"
                                    }
                                ],
                                "instances": [
                                    {
                                        "field2": "value1.2",
                                        "field3": "value1.3",
                                        "field4": "value1.4"
                                    },
                                    {
                                        "field2": "value2.2",
                                        "field3": "value2.3",
                                        "field4": "value2.4"
                                    }
                                ]
                            }
                        ]

                    }
                };
                spyOn(formDataRepository, 'getFormInstanceByFormTypeAndId').andReturn(null);
                spyOn(queryBuilder, 'loadEntityHierarchy').andReturn(entityValues);

                var formModel = formModelMapper.mapToFormModel(entitiesDef, subFormDefinition, params);

                expect(formModel).toEqual(expectedFormModel);
                expect(queryBuilder.loadEntityHierarchy).toHaveBeenCalledWith(entitiesDef, "ec", "123");
                done();
            });
        });

        describe("Sub Form save:", function () {
            async.it("should ignore empty sub entities when saving form.", function (done) {
                var subFormModel = {
                    "form": {
                        "bind_type": "mother",
                        "default_bind_path": "/Mother registration/",
                        "fields": [
                            {
                                "name": "id",
                                "source": "mother.id",
                                "value": "mother id 1"
                            },
                            {
                                "name": "field1",
                                "source": "mother.field1",
                                "bind": "field1_bind",
                                "value": "value1"
                            },
                            {
                                "name": "ecId",
                                "source": "mother.ec.id",
                                "value": "ec id 1"
                            },
                            {
                                "name": "field2",
                                "source": "mother.ec.field2",
                                "bind": "field2_bind",
                                "value": "value2"
                            }
                        ],
                        "sub_forms": [
                            {
                                "bind_type": "child",
                                "default_bind_path": "/Child Entity registration/Child Registration Entity Group",
                                "fields": [
                                    {
                                        "name": "field3",
                                        "source": "child.field3_source",
                                        "bind": "/Child Entity registration/Child Registration Entity Group/field3_bind"
                                    },
                                    {
                                        "name": "field4",
                                        "source": "child.field4_source"
                                    }
                                ],
                                "instances": []
                            }
                        ]
                    }
                };
                var expectedECInstance = {
                    "id": "ec id 1",
                    "field2": "value2"
                };
                var expectedMotherInstance = {
                    "id": "mother id 1",
                    "field1": "value1",
                    "ec_id": "ec id 1"
                };
                spyOn(formDataRepository, "saveEntity");
                spyOn(idFactory, 'generateIdFor').andCallFake(function (entityType) {
                    return "new uuid : " + entityType;
                });

                formModelMapper.mapToEntityAndSave(entitiesDef, subFormModel);

                expect(formDataRepository.saveEntity).toHaveBeenCalledWith("ec", expectedECInstance);
                expect(formDataRepository.saveEntity).toHaveBeenCalledWith("mother", expectedMotherInstance);
                expect(formDataRepository.saveEntity).not.toHaveBeenCalledWith("child", jasmine.any(Object));
                done();
            });

            async.it("should create sub entities when saving form.", function (done) {
                var subFormModel = {
                    "form": {
                        "bind_type": "mother",
                        "default_bind_path": "/Mother registration/",
                        "fields": [
                            {
                                "name": "id",
                                "source": "mother.id",
                                "value": "mother id 1"
                            },
                            {
                                "name": "field1",
                                "source": "mother.field1",
                                "bind": "field1_bind",
                                "value": "value1"
                            }
                        ],
                        "sub_forms": [
                            {
                                "bind_type": "child",
                                "default_bind_path": "/Child Entity registration/Child Registration Entity Group",
                                "fields": [
                                    {
                                        "name": "id",
                                        "source": "child.id"
                                    },
                                    {
                                        "name": "field2",
                                        "source": "child.field2_source",
                                        "bind": "/Child Entity registration/Child Registration Entity Group/field2_bind"
                                    },
                                    {
                                        "name": "field3",
                                        "source": "child.field3_source"
                                    }
                                ],
                                "instances": [
                                    {
                                        "field2": "value1.2",
                                        "field3": "value1.3"
                                    },
                                    {
                                        "field2": "value2.2",
                                        "field3": "value2.3"
                                    }
                                ]
                            }
                        ]
                    }
                };
                var expectedSubFormModel = {
                    "form": {
                        "bind_type": "mother",
                        "default_bind_path": "/Mother registration/",
                        "fields": [
                            {
                                "name": "id",
                                "source": "mother.id",
                                "value": "mother id 1"
                            },
                            {
                                "name": "field1",
                                "source": "mother.field1",
                                "bind": "field1_bind",
                                "value": "value1"
                            }
                        ],
                        "sub_forms": [
                            {
                                "bind_type": "child",
                                "default_bind_path": "/Child Entity registration/Child Registration Entity Group",
                                "fields": [
                                    {
                                        "name": "id",
                                        "source": "child.id"
                                    },
                                    {
                                        "name": "field2",
                                        "source": "child.field2_source",
                                        "bind": "/Child Entity registration/Child Registration Entity Group/field2_bind"
                                    },
                                    {
                                        "name": "field3",
                                        "source": "child.field3_source"
                                    }
                                ],
                                "instances": [
                                    {
                                        "field2": "value1.2",
                                        "field3": "value1.3",
                                        "id": "child id 1"
                                    },
                                    {
                                        "field2": "value2.2",
                                        "field3": "value2.3",
                                        "id": "child id 2"
                                    }
                                ]
                            }
                        ]
                    }
                };
                var expectedMotherInstance = {
                    "id": "mother id 1",
                    "field1": "value1"
                };
                var expectedFirstChildInstance = {
                    "field2_source": "value1.2",
                    "field3_source": "value1.3",
                    "id": "child id 1",
                    "mother_id": "mother id 1"
                };
                var expectedSecondChildInstance = {
                    "field2_source": "value2.2",
                    "field3_source": "value2.3",
                    "id": "child id 2",
                    "mother_id": "mother id 1"
                };
                var id = 0;
                spyOn(formDataRepository, "saveEntity");
                spyOn(idFactory, 'generateIdFor').andCallFake(function (entityType) {
                    if (entityType === "child") {
                        id++;
                        return "child id " + id;
                    }
                    else {
                        return "new uuid : " + entityType;
                    }
                });

                formModelMapper.mapToEntityAndSave(entitiesDef, subFormModel);

                expect(JSON.stringify(subFormModel)).toBe(JSON.stringify(expectedSubFormModel));
                expect(formDataRepository.saveEntity).toHaveBeenCalledWith("mother", expectedMotherInstance);
                expect(formDataRepository.saveEntity).toHaveBeenCalledWith("child", expectedFirstChildInstance);
                expect(formDataRepository.saveEntity).toHaveBeenCalledWith("child", expectedSecondChildInstance);
                done();
            });

            async.it("should update sub entities while saving form when entities.", function (done) {
                var subFormModel = {
                    "form": {
                        "bind_type": "ec",
                        "default_bind_path": "/Children registration/",
                        "fields": [
                            {
                                "name": "id",
                                "source": "ec.id",
                                "value": "ec id 1"
                            },
                            {
                                "name": "field1",
                                "source": "ec.field1",
                                "value": "value1"
                            },
                            {
                                "name": "motherId",
                                "source": "ec.mother.id",
                                "value": "mother id 1"
                            }
                        ],
                        "sub_forms": [
                            {
                                "bind_type": "child",
                                "default_bind_path": "/Child Entity registration/Child Registration Entity Group",
                                "fields": [
                                    {
                                        "name": "id",
                                        "source": "child.id"
                                    },
                                    {
                                        "name": "field2",
                                        "source": "child.field2_source",
                                        "bind": "/Child Entity registration/Child Registration Entity Group/field2_bind"
                                    },
                                    {
                                        "name": "field3",
                                        "source": "child.field3_source"
                                    }
                                ],
                                "instances": [
                                    {
                                        "id": "child id 0",
                                        "field2": "value1.2",
                                        "field3": "value1.3"
                                    },
                                    {
                                        "field2": "value2.2",
                                        "field3": "value2.3"
                                    }
                                ]
                            }
                        ]
                    }
                };
                var expectedSubFormModel = {
                    "form": {
                        "bind_type": "ec",
                        "default_bind_path": "/Children registration/",
                        "fields": [
                            {
                                "name": "id",
                                "source": "ec.id",
                                "value": "ec id 1"
                            },
                            {
                                "name": "field1",
                                "source": "ec.field1",
                                "value": "value1"
                            },
                            {
                                "name": "motherId",
                                "source": "ec.mother.id",
                                "value": "mother id 1"
                            }
                        ],
                        "sub_forms": [
                            {
                                "bind_type": "child",
                                "default_bind_path": "/Child Entity registration/Child Registration Entity Group",
                                "fields": [
                                    {
                                        "name": "id",
                                        "source": "child.id"
                                    },
                                    {
                                        "name": "field2",
                                        "source": "child.field2_source",
                                        "bind": "/Child Entity registration/Child Registration Entity Group/field2_bind"
                                    },
                                    {
                                        "name": "field3",
                                        "source": "child.field3_source"
                                    }
                                ],
                                "instances": [
                                    {
                                        "id": "child id 0",
                                        "field2": "value1.2",
                                        "field3": "value1.3"
                                    },
                                    {
                                        "field2": "value2.2",
                                        "field3": "value2.3",
                                        "id": "new uuid : child"
                                    }
                                ]
                            }
                        ]
                    }
                };
                var expectedECInstance = {
                    "id": "ec id 1",
                    "field1": "value1"
                };
                var expectedMotherInstance = {
                    "id": "mother id 1",
                    "ec_id": "ec id 1"
                };
                var expectedFirstChildInstance = {
                    "field2_source": "value1.2",
                    "field3_source": "value1.3",
                    "id": "child id 0",
                    "mother_id": "mother id 1"
                };
                var expectedSecondChildInstance = {
                    "field2_source": "value2.2",
                    "field3_source": "value2.3",
                    "id": "new uuid : child",
                    "mother_id": "mother id 1"
                };
                spyOn(formDataRepository, "saveEntity");
                spyOn(idFactory, 'generateIdFor').andCallFake(function (entityType) {
                    return "new uuid : " + entityType;
                });

                formModelMapper.mapToEntityAndSave(entitiesDef, subFormModel);

                expect(JSON.stringify(subFormModel)).toBe(JSON.stringify(expectedSubFormModel));
                expect(formDataRepository.saveEntity).toHaveBeenCalledWith("ec", expectedECInstance);
                expect(formDataRepository.saveEntity).toHaveBeenCalledWith("mother", expectedMotherInstance);
                expect(formDataRepository.saveEntity).toHaveBeenCalledWith("child", expectedFirstChildInstance);
                expect(formDataRepository.saveEntity).toHaveBeenCalledWith("child", expectedSecondChildInstance);
                done();
            });

            async.it("should update fields from fieldOverrides map", function (done) {
                injector
                    .require(['EntityDefinitions'],
                    function (EntityDefinitions) {
                        var entityValues = {
                            entity: {
                                field1: "value1",
                                fieldToBeOverridden: "value2"
                            }
                        };
                        var entities = EntityDefinitions.newInstance();
                        var params = {
                            "id": "id 1",
                            "formName": "entity-registration",
                            "entityId": "123",
                            "fieldOverrides": '{"fieldToBeOverridden": "Overridden_value2"}'
                        };
                        formDefinition = {
                            "form": {
                                "bind_type": "entity",
                                "default_bind_path": "/Entity registration/",
                                "fields": [
                                    {
                                        "name": "field1",
                                        "shouldLoadValue": true
                                    },
                                    {
                                        "name": "fieldToBeOverridden",
                                        "shouldLoadValue": true
                                    }
                                ]
                            }
                        };
                        var expectedFormModel = {
                            "form": {
                                "bind_type": "entity",
                                "default_bind_path": "/Entity registration/",
                                "fields": [
                                    {
                                        "name": "field1",
                                        "shouldLoadValue": true,
                                        "source": "entity.field1",
                                        "value": "value1"
                                    },
                                    {
                                        "name": "fieldToBeOverridden",
                                        "shouldLoadValue": true,
                                        "source": "entity.fieldToBeOverridden",
                                        "value": "Overridden_value2"
                                    }
                                ]
                            }
                        };
                        spyOn(formDataRepository, 'getFormInstanceByFormTypeAndId').andReturn(null);
                        spyOn(queryBuilder, 'loadEntityHierarchy').andReturn(entityValues);

                        var formModel = formModelMapper.mapToFormModel(entities, formDefinition, params);

                        expect(formModel).toEqual(expectedFormModel);
                        expect(queryBuilder.loadEntityHierarchy).toHaveBeenCalledWith(entities, "entity", "123");
                        done();
                    });
            });
        });

        async.afterEach(function (done) {
            injector.remove();
            done();
        });
    })
});

