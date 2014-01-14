define(['Squire', 'AsyncSpec'], function (Squire, AsyncSpec) {
    describe("SQL query builder:", function () {
        var injector, async = new AsyncSpec(this);

        async.beforeEach(function (done) {
            injector = new Squire();
            done();
        });

        async.it("should load a simple entity without any relations", function (done) {
            injector
                .require(['EntityDefinitions', 'EntityDef', 'FormDataRepository', 'SqlQueryBuilder'],
                function (EntityDefinitions, EntityDef, FormDataRepository, SqlQueryBuilder) {
                    var expectedEntity = JSON.stringify({
                        "entity": {
                            "id": "id 1",
                            "name": "name 1"
                        }
                    });
                    var fetchedEntity = JSON.stringify({
                        "id": "id 1",
                        "name": "name 1"
                    });
                    spyOn(FormDataRepository, "queryUniqueResult").andReturn(fetchedEntity);
                    var entityTypes = EntityDefinitions.newInstance().add(EntityDef.newInstance("entity"));

                    var entities = SqlQueryBuilder.loadEntityHierarchy(entityTypes, "entity", "entity id 1");

                    expect(JSON.stringify(entities)).toBe(expectedEntity);
                    done();
                });
        });

        async.it('should load entity with all its children', function (done) {
            injector
                .require(['EntityDefinitions', 'EntityDef', 'RelationDef', 'FormDataRepository', 'SqlQueryBuilder'],
                function (EntityDefinitions, EntityDef, RelationDef, FormDataRepository, SqlQueryBuilder) {
                    var entitiesDefinition = EntityDefinitions.newInstance()
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
                    var expectedEntity = JSON.stringify({
                        "ec": {
                            "id": "ec id 1",
                            "wifeName": "asha",
                            "mother": {
                                "id": "mother id 1",
                                "ec_id": "ec id 1",
                                "thayiCardNumber": "12345",
                                "child": [
                                    {
                                        "id": "child id 1",
                                        "mother_id": "mother id 1",
                                        "name": "putta"
                                    },
                                    {
                                        "id": "child id 2",
                                        "mother_id": "mother id 1",
                                        "name": "chinni"
                                    }
                                ]
                            }
                        }
                    });
                    spyOn(FormDataRepository, "queryUniqueResult").andCallFake(function (query) {
                        if (query === "select * from ec where id = 'ec id 1'")
                            return JSON.stringify({
                                "id": "ec id 1",
                                "wifeName": "asha"
                            });
                        if (query === "select * from mother where mother.ec_id = 'ec id 1'")
                            return JSON.stringify({
                                "id": "mother id 1",
                                "ec_id": "ec id 1",
                                "thayiCardNumber": "12345"
                            });
                        return null;
                    });
                    spyOn(FormDataRepository, "queryList").andCallFake(function (query) {
                        if (query === "select * from child where child.mother_id = 'mother id 1'")
                            return JSON.stringify([
                                {
                                    "id": "child id 1",
                                    "mother_id": "mother id 1",
                                    "name": "putta"
                                },
                                {
                                    "id": "child id 2",
                                    "mother_id": "mother id 1",
                                    "name": "chinni"
                                }
                            ]);
                        return null;
                    });

                    var ec = SqlQueryBuilder.loadEntityHierarchy(entitiesDefinition, "ec", "ec id 1");

                    expect(JSON.stringify(ec)).toBe(expectedEntity);
                    done();
                });

        });

        async.it('should load entity with all its parent', function (done) {
            injector
                .require(['EntityDefinitions', 'EntityDef', 'RelationDef', 'FormDataRepository', 'SqlQueryBuilder'],
                function (EntityDefinitions, EntityDef, RelationDef, FormDataRepository, SqlQueryBuilder) {
                    var entitiesDefinition = EntityDefinitions.newInstance()
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
                    var expectedEntity = JSON.stringify({
                        "child": {
                            "id": "child id 1",
                            "mother_id": "mother id 1",
                            "name": "putta",
                            "mother": {
                                "id": "mother id 1",
                                "ec_id": "ec id 1",
                                "thayiCardNumber": "12345",
                                "ec": {
                                    "id": "ec id 1",
                                    "wifeName": "maanu"
                                }
                            }
                        }
                    });
                    spyOn(FormDataRepository, "queryUniqueResult").andCallFake(function (query) {
                        if (query === "select * from child where id = 'child id 1'")
                            return JSON.stringify({
                                "id": "child id 1",
                                "mother_id": "mother id 1",
                                "name": "putta"
                            });
                        if (query === "select * from mother where mother.id = 'mother id 1'")
                            return JSON.stringify({
                                "id": "mother id 1",
                                "ec_id": "ec id 1",
                                "thayiCardNumber": "12345"
                            });
                        if (query === "select * from ec where ec.id = 'ec id 1'")
                            return JSON.stringify({
                                "id": "ec id 1",
                                "wifeName": "maanu"
                            });
                    });

                    var child = SqlQueryBuilder.loadEntityHierarchy(entitiesDefinition, "child", "child id 1");

                    expect(JSON.stringify(child)).toBe(expectedEntity);
                    done();
                });

        });
        async.it('should load entity with both its parents and children', function (done) {
            injector
                .require(['EntityDefinitions', 'EntityDef', 'RelationDef', 'FormDataRepository', 'SqlQueryBuilder'],
                function (EntityDefinitions, EntityDef, RelationDef, FormDataRepository, SqlQueryBuilder) {
                    var entitiesDefinition = EntityDefinitions.newInstance()
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
                    var expectedEntity = JSON.stringify({
                        "mother": {
                            "id": "mother id 1",
                            "ec_id": "ec id 1",
                            "thayiCardNumber": "12345",
                            "ec": {
                                "id": "ec id 1",
                                "wifeName": "maanu"
                            },
                            "child": [
                                {
                                    "id": "child id 1",
                                    "mother_id": "mother id 1",
                                    "name": "putta"
                                }
                            ]
                        }
                    });
                    spyOn(FormDataRepository, "queryUniqueResult").andCallFake(function (query) {
                        if (query === "select * from mother where id = 'mother id 1'")
                            return JSON.stringify({
                                "id": "mother id 1",
                                "ec_id": "ec id 1",
                                "thayiCardNumber": "12345"
                            });
                        if (query === "select * from ec where ec.id = 'ec id 1'")
                            return JSON.stringify({
                                "id": "ec id 1",
                                "wifeName": "maanu"
                            });
                        return null;
                    });
                    spyOn(FormDataRepository, 'queryList').andCallFake(function (query) {
                        if (query === "select * from child where child.mother_id = 'mother id 1'")
                            return JSON.stringify([
                                {
                                    "id": "child id 1",
                                    "mother_id": "mother id 1",
                                    "name": "putta"
                                }
                            ]);
                        return null;
                    });

                    var child = SqlQueryBuilder.loadEntityHierarchy(entitiesDefinition, "mother", "mother id 1");

                    expect(JSON.stringify(child)).toBe(expectedEntity);
                    done();
                });

        });

        async.afterEach(function (done) {
            injector.remove();
            done();
        });
    });
});

