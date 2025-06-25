const aiService = require('../services/ai.service');

module.exports.getResponse = async (req, res) => {
    const code = req.body.prompt;

    if(!code){
        return res.status(400).send("Prompt is required");
    }
    const response = await aiService(code);

    res.send(response);
}