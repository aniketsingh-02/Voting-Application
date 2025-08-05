const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Candidate = require('../models/candidate');

const checkAdminRole = async(userId) => {
  try{
       const user = await User.findById(userId);
       if(user.role === 'admin'){
        return true;
       }
       return false;
  }catch(err){
    console.error(err);
    return false;
  }
 }

// post route to add a candidate
router.post('/',jwtAuthMiddleware, async (req,res) => {
   try{
       if(! await checkAdminRole(req.user.id)){
         return res.status(403).json({message: 'user does not have admin role'});
       }
     const data = req.body // Assuming the request body contains the candidate data
 
     //Create a new User document using the Mongoose Model
     const newCandidate = new Candidate(data);
 
   //save the new user to the data 
   const response = await newCandidate.save();
   console.log('data saved');
   res.status(200).json({response: response});
   }
   catch(err){
     console.log(err);
     res.status(500).json({error: 'Internal Server Error'});
   }
 })

//update 
router.put("/:candidateId",jwtAuthMiddleware, async(req,res) => {
  try{
    if(! await checkAdminRole(req.user.id)){
         return res.status(403).json({message: 'user does not have admin role'});
       }
   const candidateId = req.params.candidateId; //Extract the id from the url paramater
    const updatedCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData,{
      new: true, // Run the updated documents
      runValidators: true, // Run the mongoose Validation
    })

    if(!response) {
      return res.status(404).json({error:'Candidate not found'});
    }
    console.log('candidate data updated');
    res.status(200).json(response);
  }catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal Server error'});
  }
});


router.delete("/:candidateId",jwtAuthMiddleware, async(req,res) => {
  try{
    if(! await checkAdminRole(req.user.id)){
        return res.status(403).json({message: 'user does not have admin role'});
       }
   const candidateId = req.params.candidateId; //Extract the id from the url paramater

    const response = await Candidate.findByIdAndDelete(candidateId);

    if(!response) {
      return res.status(404).json({error:'Candidate not found'});
    }
    console.log('candidate data deleted');
    res.status(200).json(response);
  }catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal Server error'});
  }
});

// let's start voting
router.post('/vote/:candidateID',jwtAuthMiddleware, async(req, res)=>{
  // no admin can vote
  // user can only vote once

  candidateID = req.params.candidateID;
  userId = req.user.id;

  try{
    // Find the Candidate document with the specified candidateID
    const candidate = await Candidate.findById(candidateID);
    if(!candidate){
      return res.status(404.).json({message: 'Candidate not found'});
    }

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message: 'user not found'});
    }
    if(user.isVoted){
      return res.status(400).json({message: 'You have already voted'});
    }
    if(user.role == 'admin'){
      res.status(403).json({mesage: 'admin is not allowed'});
    }

    // update the candiate document to record the vote
    candidate.votes.push({user: userId})
    candidate.voteCount++;
    await candidate.save();
    
    //update the user document
    user.isVoted = true
    await user.save();

    res.status(200).json({message: 'vote recorded successfully'});
  } catch(err){
    console.log(err);
    res.status(500).json({message: 'Internal server error'});
  }

})

//vote count
router.get('/vote/count', async (req,res) => {
  try{
    const candidate = await Candidate.find().sort({voteCount: 'desc'});

    //Map the candidates to only return their name and voteCount
    const voteRecord = candidate.map((data)=>{
      return{
        party: data.party,
        count: data.voteCount
      }
    });

    return res.status(200).json(voteRecord)
  }catch(err){
    console.log(err);
    res.status(500).json({message: 'Internal server error'});
  }
});


// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;