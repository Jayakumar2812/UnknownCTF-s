## Recommendations for the CTF's
* Use prevandao for randomness (valid in recent EVM pos chains)[https://soliditydeveloper.com/prevrandao]
* extcodesize fails when called from constructor if you soley want to prevent contracts from interaction use tx.origin == msg.sender.
* Prevent calling the pwn() twice in the same block to make sure only metamorphic contracts go through this ctf.
