define(['Squire', 'AsyncSpec'], function (Squire, AsyncSpec) {
    describe("Entity Relationships:", function () {
        var injector, async = new AsyncSpec(this);

        async.beforeEach(function (done) {
            injector = new Squire();
            done();
        });

        async.it("should identify all entities based on entity relationship", function (done) {
            injector
                .require(['ziggy/EntityRelationships', 'ziggy/EntityDefinitions', 'ziggy/EntityDef', 'ziggy/RelationDef'],
                function (EntityRelationships, EntityDefinitions, EntityDef, RelationDef) {
                    var entityRelationshipJSONDefinition = [
                        {
                            "parent": "ec",
                            "child": "mother",
                            "field": "wife",
                            "kind": "one_to_one",
                            "from": "ec.id",
                            "to": "mother.ec_id"
                        },
                        {
                            "parent": "ec",
                            "child": "father",
                            "field": "husband",
                            "kind": "one_to_one",
                            "from": "ec.id",
                            "to": "father.ec_id"
                        },
                        {
                            "parent": "mother",
                            "child": "child",
                            "field": "children",
                            "kind": "one_to_many",
                            "from": "mother.id",
                            "to": "child.mother_id"
                        },
                        {
                            "parent": "father",
                            "child": "child",
                            "field": "children",
                            "kind": "one_to_many",
                            "from": "father.id",
                            "to": "child.father_id"
                        }
                    ];
                    var expectedEntityDefinitions = EntityDefinitions.newInstance()
                        .add(EntityDef.newInstance(
                                "ec")
                            .addRelation(RelationDef.newInstance(
                                "mother",
                                "one_to_one",
                                "parent",
                                "ec.id",
                                "mother.ec_id"))
                            .addRelation(RelationDef.newInstance(
                                "father",
                                "one_to_one",
                                "parent",
                                "ec.id",
                                "father.ec_id")))
                        .add(EntityDef.newInstance(
                                "mother")
                            .addRelation(RelationDef.newInstance(
                                "ec",
                                "one_to_one",
                                "child",
                                "mother.ec_id",
                                "ec.id"))
                            .addRelation(RelationDef.newInstance(
                                "child",
                                "one_to_many",
                                "parent",
                                "mother.id",
                                "child.mother_id")))
                        .add(EntityDef.newInstance(
                                "father")
                            .addRelation(RelationDef.newInstance(
                                "ec",
                                "one_to_one",
                                "child",
                                "father.ec_id",
                                "ec.id"))
                            .addRelation(RelationDef.newInstance(
                                "child",
                                "one_to_many",
                                "parent",
                                "father.id",
                                "child.father_id")))
                        .add(EntityDef.newInstance(
                                "child")
                            .addRelation(RelationDef.newInstance(
                                "mother",
                                "many_to_one",
                                "child",
                                "child.mother_id",
                                "mother.id"))
                            .addRelation(RelationDef.newInstance(
                                "father",
                                "many_to_one",
                                "child",
                                "child.father_id",
                                "father.id")));
                    var formDefinition = {
                        "form": {
                            "bind_type": "ec"
                        }
                    };

                    var rel = EntityRelationships
                        .determineEntitiesAndRelations(entityRelationshipJSONDefinition, formDefinition);

                    expect(JSON.stringify(rel)).toBe(JSON.stringify(expectedEntityDefinitions));
                    done();
                });
        });

        async.it("should identify all entities based on entity relationship when there is a four level hierarchy", function (done) {
            injector
                .require(['ziggy/EntityRelationships', 'ziggy/EntityDefinitions', 'ziggy/EntityDef', 'ziggy/RelationDef'],
                function (EntityRelationships, EntityDefinitions, EntityDef, RelationDef) {
                    var entityRelationshipJSONDefinition = [
                        {
                            "parent": "ec",
                            "child": "mother",
                            "field": "wife",
                            "kind": "one_to_one",
                            "from": "ec.id",
                            "to": "mother.ec_id"
                        },
                        {
                            "parent": "ec",
                            "child": "father",
                            "field": "husband",
                            "kind": "one_to_one",
                            "from": "ec.id",
                            "to": "father.ec_id"
                        },
                        {
                            "parent": "mother",
                            "child": "child",
                            "field": "children",
                            "kind": "one_to_many",
                            "from": "mother.id",
                            "to": "child.mother_id"
                        },
                        {
                            "parent": "father",
                            "child": "child",
                            "field": "children",
                            "kind": "one_to_many",
                            "from": "father.id",
                            "to": "child.father_id"
                        }
                    ];
                    var expectedEntityDefinitions = EntityDefinitions.newInstance()
                        .add(EntityDef.newInstance(
                                "ec")
                            .addRelation(RelationDef.newInstance(
                                "mother",
                                "one_to_one",
                                "parent",
                                "ec.id",
                                "mother.ec_id"))
                            .addRelation(RelationDef.newInstance(
                                "father",
                                "one_to_one",
                                "parent",
                                "ec.id",
                                "father.ec_id")))
                        .add(EntityDef.newInstance(
                                "mother")
                            .addRelation(RelationDef.newInstance(
                                "ec",
                                "one_to_one",
                                "child",
                                "mother.ec_id",
                                "ec.id"))
                            .addRelation(RelationDef.newInstance(
                                "child",
                                "one_to_many",
                                "parent",
                                "mother.id",
                                "child.mother_id")))
                        .add(EntityDef.newInstance(
                                "father")
                            .addRelation(RelationDef.newInstance(
                                "ec",
                                "one_to_one",
                                "child",
                                "father.ec_id",
                                "ec.id"))
                            .addRelation(RelationDef.newInstance(
                                "child",
                                "one_to_many",
                                "parent",
                                "father.id",
                                "child.father_id")))
                        .add(EntityDef.newInstance(
                                "child")
                            .addRelation(RelationDef.newInstance(
                                "mother",
                                "many_to_one",
                                "child",
                                "child.mother_id",
                                "mother.id"))
                            .addRelation(RelationDef.newInstance(
                                "father",
                                "many_to_one",
                                "child",
                                "child.father_id",
                                "father.id")));
                    var formDefinition = {
                        "form": {
                            "bind_type": "ec"
                        }
                    };

                    var rel = EntityRelationships
                        .determineEntitiesAndRelations(entityRelationshipJSONDefinition, formDefinition);

                    expect(JSON.stringify(rel)).toBe(JSON.stringify(expectedEntityDefinitions));
                    done();
                });
        });

        async.it("should identify all entities based on entity relationship and form definition", function (done) {
            injector
                .require(['ziggy/EntityRelationships', 'ziggy/EntityDefinitions', 'ziggy/EntityDef', 'ziggy/RelationDef'],
                function (EntityRelationships, EntityDefinitions, EntityDef, RelationDef) {
                    var entityRelationshipJSONDefinition = [
                        {
                            "parent": "ec",
                            "child": "mother",
                            "field": "wife",
                            "kind": "one_to_one",
                            "from": "ec.id",
                            "to": "mother.ec_id"
                        },
                        {
                            "parent": "mother",
                            "child": "child",
                            "field": "children",
                            "kind": "one_to_many",
                            "from": "mother.id",
                            "to": "child.mother_id"
                        }
                    ];
                    var expectedEntityDefinitions = EntityDefinitions.newInstance()
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
                                "mother.id")))
                        .add(EntityDef.newInstance("family"));
                    var formDefinition = {
                        "form": {
                            "bind_type": "family"
                        }
                    };

                    var entities = EntityRelationships
                        .determineEntitiesAndRelations(entityRelationshipJSONDefinition, formDefinition);

                    expect(JSON.stringify(entities)).toEqual(JSON.stringify(expectedEntityDefinitions));
                    done();
                });
        });

        async.it("should not add entity from form definition if already added", function (done) {
            injector
                .require(['ziggy/EntityRelationships', 'ziggy/EntityDefinitions', 'ziggy/EntityDef', 'ziggy/RelationDef'],
                function (EntityRelationships, EntityDefinitions, EntityDef, RelationDef) {
                    var entityRelationshipJSONDefinition = [
                        {
                            "parent": "ec",
                            "child": "mother",
                            "field": "wife",
                            "kind": "one_to_one",
                            "from": "ec.id",
                            "to": "mother.ec_id"
                        },
                        {
                            "parent": "mother",
                            "child": "child",
                            "field": "children",
                            "kind": "one_to_many",
                            "from": "mother.id",
                            "to": "child.mother_id"
                        }
                    ];
                    var expectedEntityDefinitions = EntityDefinitions.newInstance()
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
                    var formDefinition = {
                        "form": {
                            "bind_type": "ec"
                        }
                    };

                    var entities = EntityRelationships
                        .determineEntitiesAndRelations(entityRelationshipJSONDefinition, formDefinition);

                    expect(JSON.stringify(entities)).toEqual(JSON.stringify(expectedEntityDefinitions));
                    done();
                });
        });

        async.it("should not add entity from form definition if already added", function (done) {
            injector
                .require(['ziggy/EntityRelationships', 'ziggy/EntityDefinitions', 'ziggy/EntityDef', 'ziggy/RelationDef'],
                function (EntityRelationships, EntityDefinitions, EntityDef, RelationDef) {
                    var entityRelationshipJSONDefinition = [
                        {
                            "parent": "ec",
                            "child": "mother",
                            "field": "wife",
                            "kind": "one_to_one",
                            "from": "ec.id",
                            "to": "mother.ec_id"
                        },
                        {
                            "parent": "mother",
                            "child": "child",
                            "field": "children",
                            "kind": "one_to_many",
                            "from": "mother.id",
                            "to": "child.mother_id"
                        }
                    ];
                    var expectedEntityDefinitions = EntityDefinitions.newInstance()
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
                    var formDefinition = {
                        "form": {
                            "bind_type": "ec"
                        }
                    };

                    var entities = EntityRelationships
                        .determineEntitiesAndRelations(entityRelationshipJSONDefinition, formDefinition);

                    expect(JSON.stringify(entities)).toEqual(JSON.stringify(expectedEntityDefinitions));
                    done();
                });
        });

        async.it("should add entity from form definition when there are no entities in entity relationship JSON", function (done) {
            injector
                .require(['ziggy/EntityRelationships', 'ziggy/EntityDefinitions', 'ziggy/EntityDef'],
                function (EntityRelationships, EntityDefinitions, EntityDef) {
                    var entityRelationshipJSONDefinition = null;
                    var formDefinition = {
                        "form": {
                            "bind_type": "village"
                        }
                    };
                    var expectedEntityDefinitions = EntityDefinitions.newInstance().add(EntityDef.newInstance("village"));

                    var entities = EntityRelationships
                        .determineEntitiesAndRelations(entityRelationshipJSONDefinition, formDefinition);

                    expect(JSON.stringify(entities)).toBe(JSON.stringify(expectedEntityDefinitions));
                    done();
                });
        });

        async.it("should return empty entities list when there are no entities", function (done) {
            injector
                .require(['ziggy/EntityRelationships', 'ziggy/EntityDefinitions'],
                function (EntityRelationships, EntityDefinitions) {
                    var entityRelationshipJSONDefinition = null;
                    var formDefinition = {
                        "form": {}
                    };
                    var expectedEntities = EntityDefinitions.newInstance();

                    var entities = EntityRelationships
                        .determineEntitiesAndRelations(entityRelationshipJSONDefinition, formDefinition);

                    expect(JSON.stringify(entities)).toBe(JSON.stringify(expectedEntities));
                    done();
                });
        });

        async.afterEach(function (done) {
            injector.remove();
            done();
        });
    });
});