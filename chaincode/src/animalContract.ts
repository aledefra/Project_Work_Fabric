import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import { Animal, Owner } from './animal';

export class AnimalContract extends Contract {
    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {

    }

    // CreateAnimal issues a new animal to the world state with given details.
    @Transaction()
    public async createAnimal(ctx: Context, id: string, name: string, type: string, breed: string, birthDate: string, description: string, imgUrl: string, pedigree: string,
        ownerId: string, ownerLastname: string, ownerName: string): Promise<void> {
        const exists = await this.animalExists(ctx, id);
        if (exists) {
            throw new Error(`The animal ${id} already exists`);
        }

        const animal = {
            name: name,
            type: type,
            breed: breed,
            birthDate: birthDate,
            description: description,
            imgUrl: imgUrl,
            pedigree: pedigree,
            ownerId: ownerId,
            ownerName: ownerName,
            ownerLastname: ownerLastname

        }
        // we insert animal in the world state
        await ctx.stub.putState(id, Buffer.from(stringify(animal)));
    }

    // UpdateAnimalName updates an existing animal name in the world state with provided parameters.
    @Transaction()
    public async updateAnimalName(ctx: Context, id: string, newname: string,): Promise<void> {
        const exists = await this.animalExists(ctx, id);
        if (!exists) {
            throw new Error(`The animal with id:${id} does not exist`);
        }

        const animalString = await this.readAnimal(ctx, id);
        const animal = JSON.parse(animalString) as Animal;
        animal.name = newname


        // we insert data in the world state
        return ctx.stub.putState(id, Buffer.from(stringify(animal)));
    }

    // ReadAnimal returns the animal stored in the world state with given id.
    @Transaction(false)
    public async readAnimal(ctx: Context, id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(id); // get the animal from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The animal with id:${id} does not exist`);
        }
        return assetJSON.toString();
    }
    // AnimalExists returns true when animal with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async animalExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // UpdateAnimal updates an existing animal in the world state with provided parameters.
    @Transaction()
    public async updateAnimal(ctx: Context, id: string, name: string, type: string, breed: string, birthDate: string, description: string, imgUrl: string, pedigree: string, ownerId: string, ownerName: string, ownerLastname: string): Promise<void> {
        const exists = await this.animalExists(ctx, id);
        if (!exists) {
            throw new Error(`The animal with id:${id} does not exist`);
        }

        // overwriting original animal with new updatedAnimal
        const updatedAnimal = {
            ID: id,
            name: name,
            type: type,
            breed: breed,
            birthDate: birthDate,
            description: description,
            imgUrl: imgUrl,
            pedigree: pedigree,
            ownerId: ownerId,
            ownerName: ownerName,
            ownerLastname: ownerLastname,
        };
        // we insert data in the world state
        return ctx.stub.putState(id, Buffer.from(stringify(updatedAnimal)));
    }

    // DeleteAnimal deletes a given animal from the world state.
    @Transaction()
    public async deleteAnimal(ctx: Context, id: string): Promise<void> {
        const exists = await this.animalExists(ctx, id);
        if (!exists) {
            throw new Error(`The animal with id:${id} does not exist`);
        }
        return ctx.stub.deleteState(id);

    }

    // GetAllAnimals returns all animals found in the world state.
    @Transaction(false)
    @Returns('string')
    public async getAllAnimals(ctx: Context): Promise<string> {
        const allAnimals: Animal[] = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            console.log(strValue);
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allAnimals.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allAnimals);
    }

    @Transaction(false)
    public async getAnimalHistory(ctx: Context, id: string) {
        let resultsIterator = await ctx.stub.getHistoryForKey(id);
        let results = await this._GetAllResults(resultsIterator, true);

        return JSON.stringify(results);

    }

    public async _GetAllResults(iterator, isHistory) {
        let allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                let jsonRes: any = {};
                console.log(res.value.value.toString("utf-8"));
                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.txId;
                    jsonRes.Timestamp = res.value.timestamp;
                    try {
                        jsonRes.value = JSON.parse(res.value.value.toString("utf-8"));
                    } catch (e) {
                        console.log(e);
                        jsonRes.value = res.value.value.toString("utf-8");
                    }
                }
                else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString("utf-8"))
                    }
                    catch (e) {
                        console.log(e);
                        jsonRes.Record = res.value.value.toString("utf-8");
                    }
                }
                allResults.push(jsonRes);
            }
            res = await iterator.next();
        }
        iterator.close();
        return allResults;
    } @Transaction(false)
    public async getAnimalByName(ctx: Context, name: string): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getQueryResult(name);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString(
                "utf8"
            );
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    @Transaction(false)
    public async getAnimalByOwner(
        ctx: Context,
        ownerId: string
    ): Promise<string> {
        const allResults = [];

        const iterator = await ctx.stub.getQueryResult(ownerId);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString(
                "utf8"
            );
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    @Transaction()
    public async changeOwner(
        ctx: Context,
        id: string,
        newId: string,
        newOwnerName: string,
        newOwnerLastname: string
    ): Promise<void> {
        const exists = await this.animalExists(ctx, id);
        if (!exists) {
            throw new Error(`The animal ${id} does not exist`);
        }

        const updatedOwner = {
            ownerId: newId,
            ownerName: newOwnerName,
            ownerLastname: newOwnerLastname,
        };

        return ctx.stub.putState(id, Buffer.from(stringify(updatedOwner)));
    }
}
