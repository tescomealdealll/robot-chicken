# How to run

## With Docker (less wtfs involved)

- Change env.js.example to your liking and rename it to env.js, then:
- Get Docker for [Windows](https://docs.docker.com/desktop/install/windows-install/) or [Linux](https://docs.docker.com/desktop/install/linux-install/)

### Build
``` 
docker build -t chicken-bot .
```

### Run

You can either run the script with or without a persistent database and blacklist.

- For ephemeral database and blacklist:

```
docker run chicken-bot
```

- To use current directory as a persistent volume:

```
docker run -v $(pwd):/chicken-bot chicken-bot
```

## Without Docker (more wtfs involved)

- Install nodejs

- Install dependencies with: `cd robot-chicken; npm install`

- Install the [Babel compiler](https://www.npmjs.com/package/@babel/core)

- Make sure you can call `babel` from the command-line

- Run the compiler with `babel chicken-bot.js --out-file transpiled-chicken-bot.js`

- Change env.js.example to your liking and rename it to env.js

- Run the compiled file with `node transpiled-chicken-bot.js` 😎


![zerobee](https://static.wikia.nocookie.net/0b0t/images/5/50/Wiki-background/revision/latest?cb=20200716085243])
