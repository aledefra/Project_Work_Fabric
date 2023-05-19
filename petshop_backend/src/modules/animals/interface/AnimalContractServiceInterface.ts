import { Animal, Owner } from "../entity";

export interface AnimalContractServiceInterface {
    createAnimal(owner: Owner): Promise<string>;
    updateAnimal(id: string, owner: Owner): Promise<string>;
    updateAnimalName(id: string, name: string): Promise<string>;
    deleteAnimal(id: string): Promise<void>;
    getAllAnimal(): Promise<string>;
    readAnimal(id: string): Promise<string>;
    animalExist(id: string): Promise<string>;
    getAnimalHistory(id: string): Promise<string>;
    getAnimalByName(animalName: string): Promise<Animal>;
    getAnimalByOwner(ownerId: string): Promise<Animal>;
    changeOwner(
        id: string,
        ownerId: string,
        ownerLastname: string,
        ownerName: string
    ): Promise<string>;
}
