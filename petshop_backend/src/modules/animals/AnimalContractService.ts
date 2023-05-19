import { AnimalContractServiceInterface } from "./interface/AnimalContractServiceInterface";
import { Animal, Owner } from "./entity";
import { BlockchainServiceInterface } from "../fabric/interface/BlockchainServiceInterface";
import { getBlockchainService } from "../common/ServiceFactory";
import config from "../../config/Config";
import { TextDecoder } from "util";

export class AnimalContractService implements AnimalContractServiceInterface {
    private blockchainService: BlockchainServiceInterface =
        getBlockchainService();
    private utf8Decoder = new TextDecoder();

    async createAnimal(owner: Owner): Promise<string> {
        const gateway = await this.blockchainService.connect();
        const network = gateway.getNetwork(config.fabric.channel.name);
        const contract = network.getContract(config.fabric.chaincode.name);

        try {
            const commit = await contract.submitAsync("createAnimal", {
                arguments: [
                    owner.name,
                    owner.type,
                    owner.breed,
                    owner.birthDate,
                    owner.description,
                    owner.imgUrl,
                    owner.pedigree.toString(),
                    owner.ownerId,
                    owner.ownerName,
                    owner.ownerLastname,
                ],
            });

            const resultJson = this.utf8Decoder.decode(commit.getResult());
            console.log(resultJson);
            return commit.getTransactionId();
        } catch (error) {
            console.log("Error during the creation of the animal with message: ", error);
            throw error;
        }
    }

    async updateAnimalName(_id: string, name: string): Promise<string> {
        const gateway = await this.blockchainService.connect();
        const network = gateway.getNetwork(config.fabric.channel.name);
        const contract = network.getContract(config.fabric.chaincode.name);
        try {
            const commit = await contract.submitAsync("updateAnimalName", {
                arguments: [_id, name],
            });
            const resultJson = this.utf8Decoder.decode(commit.getResult());
            console.log(resultJson);
            return commit.getTransactionId();
        } catch (error) {
            console.log("Error during the animal name update with message: ", error);
            throw error;
        }
    }

    async updateAnimal(_id: string, owner: Owner): Promise<string> {
        const gateway = await this.blockchainService.connect();
        const network = gateway.getNetwork(config.fabric.channel.name);
        const contract = network.getContract(config.fabric.chaincode.name);
        try {
            const commit = await contract.submitAsync(`updateAnimal`, {
                arguments: [
                    _id,
                    owner.name,
                    owner.type,
                    owner.breed,
                    owner.birthDate.toString(),
                    owner.description,
                    String(owner.pedigree),
                    owner.ownerId,
                    owner.ownerName,
                    owner.ownerLastname,
                ],
            });
            const resultJson = this.utf8Decoder.decode(commit.getResult());
            console.log(resultJson);
            return commit.getTransactionId();
        } catch (error) {
            console.log("Error during animal update with message: ", error);
            throw error;
        }
    }

    async deleteAnimal(_id: string): Promise<void> {
        const gateway = await this.blockchainService.connect();
        const network = gateway.getNetwork(config.fabric.channel.name);
        const contract = network.getContract(config.fabric.chaincode.name);
        try {
            const commit = await contract.submitAsync(`deleteAnimal`, {
                arguments: [_id],
            });
        } catch (error) {
            console.log("Error during deletion of animal with message: ", error);
            throw error;
        }
    }

    async getAllAnimal(): Promise<string> {
        const gateway = await this.blockchainService.connect();
        const network = gateway.getNetwork(config.fabric.channel.name);
        const contract = network.getContract(config.fabric.chaincode.name);
        try {
            const commit = await contract.submitAsync(`getAllAnimals`, {
                arguments: [],
            });
            const resultJson = this.utf8Decoder.decode(commit.getResult());
            return commit.getTransactionId();
        } catch (error) {
            console.log("Error during fetching animals with message: ", error);
            throw error;
        }
    }

    async readAnimal(_id: string): Promise<string> {
        const gateway = await this.blockchainService.connect();
        const network = gateway.getNetwork(config.fabric.channel.name);
        const contract = network.getContract(config.fabric.chaincode.name);
        try {
            const commit = await contract.submitAsync(`readAnimal`, {
                arguments: [_id],
            });
            const resultJson = this.utf8Decoder.decode(commit.getResult());
            return commit.getTransactionId();
        } catch (error) {
            console.log("Error during animal reading with message: ", error);
            throw error;
        }
    }

    async animalExist(_id: string): Promise<string> {
        const gateway = await this.blockchainService.connect();
        const network = gateway.getNetwork(config.fabric.channel.name);
        const contract = network.getContract(config.fabric.chaincode.name);
        try {
            const commit = await contract.submitAsync(`animalExist`, {
                arguments: [_id],
            });
            const resultJson = this.utf8Decoder.decode(commit.getResult());
            return commit.getTransactionId();
        } catch (error) {
            console.log("Error during animalExist with message: ", error);
            throw error;
        }
    }

    async getAnimalHistory(_id: string): Promise<string> {
        const gateway = await this.blockchainService.connect();
        const network = gateway.getNetwork(config.fabric.channel.name);
        const contract = network.getContract(config.fabric.chaincode.name);
        try {
            const resultBytes = await contract.evaluateTransaction(
                "getAnimalHistory",
                _id
            );
            const resultJson = this.utf8Decoder.decode(resultBytes);
            return JSON.stringify(JSON.parse(resultJson));
        } catch (error) {
            console.log("Error during animal history with message: ", error);
            throw error;
        }
    }

    async getAnimalByName(animalName: string): Promise<Animal> {
        const gateway = await this.blockchainService.connect();
        const network = gateway.getNetwork(config.fabric.channel.name);
        const contract = network.getContract(config.fabric.chaincode.name);
        try {
            const resultBytes = await contract.evaluateTransaction(
                "getAnimalByName",
                `{"selector":{"name": "${animalName}"} }`
            );
            const resultJson = this.utf8Decoder.decode(resultBytes);
            return JSON.parse(resultJson) as Animal;
        } catch (error) {
            console.log("Error during fetching of animal with this name with message: ", error);
            throw error;
        }
    }

    private prettyJSONString(inputString) {
        return JSON.stringify(JSON.parse(inputString), null, 2);
    }

    async getAnimalByOwner(ownerId: string): Promise<Animal> {
        const gateway = await this.blockchainService.connect();
        const network = gateway.getNetwork(config.fabric.channel.name);
        const contract = network.getContract(config.fabric.chaincode.name);
        try {
            const resultBytes = await contract.evaluateTransaction(
                "getAnimalByOwner",
                `{"selector":{"owner_id": "${ownerId}"} }`
            );
            const resultJson = this.utf8Decoder.decode(resultBytes);
            return JSON.parse(resultJson) as Animal;
        } catch (error) {
            console.log("Error during fetching animal by owner with message: ", error);
            throw error;
        }
    }

    async changeOwner(
        _id: string,
        ownerId: string,
        ownerName: string,
        ownerLastname: string
    ): Promise<string> {
        const gateway = await this.blockchainService.connect();
        const network = gateway.getNetwork(config.fabric.channel.name);
        const contract = network.getContract(config.fabric.chaincode.name);
        try {
            const commit = await contract.submitAsync("ChangeOwner", {
                arguments: [_id, ownerId, ownerLastname, ownerName],
            });
            const resultJson = this.utf8Decoder.decode(commit.getResult());
            console.log(resultJson);
            return commit.getTransactionId();
        } catch (error) {
            console.log("Error during the change of the owner with message: ", error);
            throw error;
        }
    }
}
