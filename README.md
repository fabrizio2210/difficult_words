## Difficult words

Difficult words is a Wep Progressive Application which allows you to find the "hardest" words in a film or TV Show by using the subtitle.
Actually, it can parse every text provided as .txt file.

It uses [OpenSubtitles API](https://www.opensubtitles.org/en/search/subs) to fetch the subtitle of the film/episode.
Then, it uses [DataMuse](https://datamuse.com/) to retieve definition and frequency.

Written by Fabrizio Waldner.

### Install/Use

You need Docker engine installed on the PC.

```
$ git clone https://github.com/fabrizio2210/difficult_words.git
$ cd difficult_words/
$ docker/lib/createLocalStack.sh
```

Point your browser to http://localhost/


### Develop 

You need Docker engine installed on the PC.

```
$ git clone https://github.com/fabrizio2210/difficult_words.git
$ cd difficult_words/
$ docker/lib/createLocalDevStack.sh
```

Point your browser to http://localhost/ and at every change the website will be updated.
