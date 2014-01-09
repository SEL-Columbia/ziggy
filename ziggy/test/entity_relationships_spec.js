describe("Entity Relationships", function () {
    it("should identify all entities based on entity relationship", function () {
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
        var expectedEntityDefinitions = new enketo.EntityDefinitions()
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
        var formDefinition = {
            "form": {
                "bind_type": "ec"
            }
        }

        var entities = new enketo.EntityRelationships(entityRelationshipJSONDefinition, formDefinition)
            .determineEntitiesAndRelations();

        expect(JSON.stringify(entities)).toEqual(JSON.stringify(expectedEntityDefinitions));
    });

    it("should identify all entities based on entity relationship when there is a four level hierarchy", function () {
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
        var expectedEntityDefinitions = new enketo.EntityDefinitions()
            .add(new enketo.EntityDef(
                "ec")
                .addRelation(new enketo.RelationDef(
                    "mother",
                    "one_to_one",
                    "parent",
                    "ec.id",
                    "mother.ec_id"))
                .addRelation(new enketo.RelationDef(
                    "father",
                    "one_to_one",
                    "parent",
                    "ec.id",
                    "father.ec_id")))
            .add(new enketo.EntityDef(
                "mother")
                .addRelation(new enketo.RelationDef(
                    "ec",
                    "one_to_one",
                    "child",
                    "mother.ec_id",
                    "ec.id"))
                .addRelation(new enketo.RelationDef(
                    "child",
                    "one_to_many",
                    "parent",
                    "mother.id",
                    "child.mother_id")))
            .add(new enketo.EntityDef(
                "father")
                .addRelation(new enketo.RelationDef(
                    "ec",
                    "one_to_one",
                    "child",
                    "father.ec_id",
                    "ec.id"))
                .addRelation(new enketo.RelationDef(
                    "child",
                    "one_to_many",
                    "parent",
                    "father.id",
                    "child.father_id")))
            .add(new enketo.EntityDef(
                "child")
                .addRelation(new enketo.RelationDef(
                    "mother",
                    "many_to_one",
                    "child",
                    "child.mother_id",
                    "mother.id"))
                .addRelation(new enketo.RelationDef(
                    "father",
                    "many_to_one",
                    "child",
                    "child.father_id",
                    "father.id")));
        var formDefinition = {
            "form": {
                "bind_type": "ec"
            }
        }

        var rel = new enketo.EntityRelationships(entityRelationshipJSONDefinition, formDefinition)
            .determineEntitiesAndRelations();

        expect(JSON.stringify(rel)).toBe(JSON.stringify(expectedEntityDefinitions));
    });

    it("should identify all entities based on entity relationship and form definition", function () {
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
        var expectedEntityDefinitions = new enketo.EntityDefinitions()
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
                    "mother.id")))
            .add(new enketo.EntityDef("family"));
        var formDefinition = {
            "form": {
                "bind_type": "family"
            }
        }

        var entities = new enketo.EntityRelationships(entityRelationshipJSONDefinition, formDefinition)
            .determineEntitiesAndRelations();

        expect(JSON.stringify(entities)).toEqual(JSON.stringify(expectedEntityDefinitions));
    });

    it("should not add entity from form definition if already added", function () {
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
        var expectedEntityDefinitions = new enketo.EntityDefinitions()
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
        var formDefinition = {
            "form": {
                "bind_type": "ec"
            }
        }

        var entities = new enketo.EntityRelationships(entityRelationshipJSONDefinition, formDefinition)
            .determineEntitiesAndRelations();

        expect(JSON.stringify(entities)).toEqual(JSON.stringify(expectedEntityDefinitions));
    });

    it("should add entity from form definition when there are no entities in entity relationship JSON", function () {
        var entityRelationshipJSONDefinition = null;
        var expectedEntityDefinitions = new enketo.EntityDefinitions().add(new enketo.EntityDef("village"));
        var formDefinition = {
            "form": {
                "bind_type": "village"
            }
        }

        var entities = new enketo.EntityRelationships(entityRelationshipJSONDefinition, formDefinition)
            .determineEntitiesAndRelations();

        expect(JSON.stringify(entities)).toBe(JSON.stringify(expectedEntityDefinitions));
    });

    it("should return empty entities list when there are no entities", function () {
        var entityRelationshipJSONDefinition = null;
        var expectedEntityDefinitions = new enketo.EntityDefinitions();
        var formDefinition = {
            "form": {}
        }

        var entities = new enketo.EntityRelationships(entityRelationshipJSONDefinition, formDefinition)
            .determineEntitiesAndRelations();

        expect(JSON.stringify(entities)).toBe(JSON.stringify(expectedEntityDefinitions));
    });
});