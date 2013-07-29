describe("SQL query builder", function () {
    var sqlQueryBuilder;
    var formDataRepository;

    beforeEach(function () {
        formDataRepository = new enketo.FormDataRepository();
        sqlQueryBuilder = new enketo.SQLQueryBuilder(formDataRepository);
    });

    it("should load a simple entity without any relations", function () {
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
        spyOn(formDataRepository, "queryUniqueResult").andReturn(fetchedEntity);
        var entityTypes = new enketo.EntityDefinitions()
            .add(new enketo.EntityDef("entity"));

        var entities = sqlQueryBuilder.loadEntityHierarchy(entityTypes, "entity", "entity id 1");

        expect(JSON.stringify(entities)).toBe(expectedEntity);
    });

    it("should load entity with all its children", function () {
        var entitiesDefinition = new enketo.EntityDefinitions()
            .add(new enketo.EntityDef(
                "ec").addRelation(new enketo.RelationDef(
                    "mother",
                    "one_to_one",
                    "parent",
                    "ec.id",
                    "mother.ec_id")))
            .add(new enketo.EntityDef(
                "mother").addRelation(new enketo.RelationDef(
                    "ec",
                    "one_to_one",
                    "child",
                    "mother.ec_id",
                    "ec.id")).addRelation(new enketo.RelationDef(
                    "child",
                    "one_to_many",
                    "parent",
                    "mother.id",
                    "child.mother_id")))
            .add(new enketo.EntityDef(
                "child").addRelation(new enketo.RelationDef(
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
        spyOn(formDataRepository, "queryUniqueResult").andCallFake(function (query) {
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
        spyOn(formDataRepository, "queryList").andCallFake(function (query) {
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

        var ec = sqlQueryBuilder.loadEntityHierarchy(entitiesDefinition, "ec", "ec id 1");

        expect(JSON.stringify(ec)).toBe(expectedEntity);
    });

    it("should load entity with all its parent", function () {
        var entitiesDefinition = new enketo.EntityDefinitions()
            .add(new enketo.EntityDef(
                "ec").addRelation(new enketo.RelationDef(
                    "mother",
                    "one_to_one",
                    "parent",
                    "ec.id",
                    "mother.ec_id")))
            .add(new enketo.EntityDef(
                "mother").addRelation(new enketo.RelationDef(
                    "ec",
                    "one_to_one",
                    "child",
                    "mother.ec_id",
                    "ec.id")).addRelation(new enketo.RelationDef(
                    "child",
                    "one_to_many",
                    "parent",
                    "mother.id",
                    "child.mother_id")))
            .add(new enketo.EntityDef(
                "child").addRelation(new enketo.RelationDef(
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

        spyOn(formDataRepository, "queryUniqueResult").andCallFake(function (query) {
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

        var child = sqlQueryBuilder.loadEntityHierarchy(entitiesDefinition, "child", "child id 1");

        expect(JSON.stringify(child)).toBe(expectedEntity);
    });

    it("should load entity with both its parents and children", function () {
        var entitiesDefinition = new enketo.EntityDefinitions()
            .add(new enketo.EntityDef(
                "ec").addRelation(new enketo.RelationDef(
                    "mother",
                    "one_to_one",
                    "parent",
                    "ec.id",
                    "mother.ec_id")))
            .add(new enketo.EntityDef(
                "mother").addRelation(new enketo.RelationDef(
                    "ec",
                    "one_to_one",
                    "child",
                    "mother.ec_id",
                    "ec.id")).addRelation(new enketo.RelationDef(
                    "child",
                    "one_to_many",
                    "parent",
                    "mother.id",
                    "child.mother_id")))
            .add(new enketo.EntityDef(
                "child").addRelation(new enketo.RelationDef(
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
        spyOn(formDataRepository, "queryUniqueResult").andCallFake(function (query) {
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
        spyOn(formDataRepository, 'queryList').andCallFake(function (query) {
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

        var child = sqlQueryBuilder.loadEntityHierarchy(entitiesDefinition, "mother", "mother id 1");

        expect(JSON.stringify(child)).toBe(expectedEntity);
    });
});
