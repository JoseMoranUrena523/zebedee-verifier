const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');

const express = require('express');
const fetch = require('node-fetch');
const session = require('express-session');
const crypto = require('crypto');
const app = express();

const { QuickDB } = require("quick.db");
const db = new QuickDB();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

function base64URLEncode(str) {
  return str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function GeneratePKCE() {
  const verifier = base64URLEncode(crypto.randomBytes(32));

  if (verifier) {
    const challenge = base64URLEncode(sha256(verifier));
    return { challenge, verifier };
  }
}

app.get('/login', (req, res) => {
  if (!req.query.discord) {
    res.send("It seems like you haven't ran the command /verify in your server.")
  }

  var withoutSpaces = req.query.discord.replace(/\s/g, '');
	
  var isOnlyNum = /^\d+$/.test(withoutSpaces);
  if (!isOnlyNum) {
    res.send("Invalid Discord ID entered.")
  }

  req.session.discord = withoutSpaces;
	
  const clientId = process.env.ZEBEDEE_CLIENT_ID;
  const redirectUri = `${process.env.HOST_URI}/callback`;
  const { verifier, challenge } = GeneratePKCE();
  const scope = "user";
  const url = `https://api.zebedee.io/v0/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&code_challenge_method=S256&code_challenge=${challenge}&scope=${scope}`;
	
  req.session.codeVerifier = verifier;
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
	
  const codeVerifier = req.session.codeVerifier;
  
  const body = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: `${process.env.HOST_URI}/callback`,
    code_verifier: codeVerifier,
    client_id: process.env.ZEBEDEE_CLIENT_ID,
    client_secret: process.env.ZEBEDEE_CLIENT_SECRET
  };
  try {
    const response = await fetch('https://api.zebedee.io/v0/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log(data);
    
    req.session.accessToken = data.access_token;
    
    const gamertagResponse = await fetch('https://api.zebedee.io/v0/oauth2/user', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.access_token}`
      }
    });
    const gamertagData = await gamertagResponse.json();
    console.log(gamertagData);
    const gamertag = gamertagData.data.gamertag;
    res.redirect(`/?gamertag=${gamertag}&discord=${req.session.discord}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error exchanging code for access token');
  }
});

app.get('/', async (req, res) => {
  if (!req.query.gamertag || !req.query.discord || req.session.discord) {
    res.send("Looks like you haven't been through the verification process, do /verify in your server to verify yourself!");
  } else {
    db.set(`${req.query.discord}_verify`, true);
    res.send(`You have successfully been verified. You can now close this tab, and run /verify again.`);
  }
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}.`);
	client.user.setActivity('verification attempts.', { type: ActivityType.Watching });
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(process.env.token);
app.listen(process.env.PORT);
