# Getting Set Up

The gory, glorious details.

Any command here should be run from the root of this repo.

## What's Missing

 * Some NPM modules are missing?
 * Some Python modules are missing?
 * Possibly missing other stuff, this is all from memory

#### Basic Prereqs

You're going to need a recent version of nodejs and Python.  On Ubuntu:

```bash
sudo apt-get install python3
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash - # WHAT COULD GO WRONG
sudo apt-get install -y nodejs
```

You'll also need some dev stuff to be able to properly install Python
deps.  On Ubuntu:

```bash
sudo apt-get install build-essential python3-dev libpq-dev libjpeg-dev \
                     libxml2-dev libxslt1-dev
```

#### Virtual Env

First thing first, you should use a Python virtualenv for all your dev
work.  The good news is that this is baked into Python3, so all you need
to do is:

```bash
pyvenv venv/
```
The `venv/` dir is already in the `.gitignore`, so you don't need to
worry about committing it.  Once you have your venv, you'll need to activate
it in your shell whenever you're working on this repo:

```bash
source venv/bin/activate # For bash-esque shells
source venv/bin/activate.csh # For (t)csh
source venv/bin/activate.fish # For our lord and savior, the fish shell
```

#### Dependencies

Now the fun (by which I mean slow, so slow, so painful) part!  Let's
install those dependencies:

```bash
pip install -r requirements.txt # Install python deps
npm install # Installs nodejs deps
```

#### Private Keys

SSH is super cool, especially with financial data.  You should realllyy
use it when working on Spendwell (and in fact, all the default are set up
such that it's more painful to NOT use it in dev).  Here's how, on Ubuntu:

```bash
mkdir local/ # Key's gotta go here

# Cook up a self-signed cert
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout local/dev_spendwell_co.key \
            -out local/dev_spendwell_co.crt
# This command is going to ask you a few things.  You can leave them
# all blank, except for one:
# Common Name: dev.spendwell.co

# Finally, you need to make a DNS entry for that dev URL so you can
# actually use it.
sudo sh -c 'echo "127.0.0.1    dev.spendwell.co" >>/etc/hosts'
```

#### Server Setup

You'll need a Postgres server and Redis to boot.  More Ubuntu goodness:

```bash
sudo apt-get install redis-server
sudo apt-get install postgresql
```

You'll need to tweak the Postgres config to get started, which I should go
into here, but won't.  You're on your own for now.

#### Django Setup

You need a `local.py` file inside `spendwell/settings/`, use these
contents as a starting point:

```python
SITE_DOMAIN = 'dev.spendwell.co'
ALLOWED_HOSTS = [SITE_DOMAIN]
DEBUG = True
DATABASES['default'] = {
    'ENGINE': 'django.db.backends.postgresql_psycopg2',
    'HOST': '127.0.0.1',
    'NAME': '', # Fill me in!
    'USER': '', # Fill me in!
    'PASSWORD': '', # Fill me in!
}
```

You'll need to fire off a few commands to get Django ready to rock:

```bash
./manage.py migrate # Bootstrap yo DB
./manage.py createsuperuser # Create yourself an admin-capable user
```

Once this is done, you'll still be missing data in your DB.  The best
solution here is to pester somebody for demo data, or to...

#### Get Data

No clue how.  Fill this in if you learn!

#### Running it all

Now comes the exciting moment, but you're actually not quite there yet.
You need to grab the [Caddy server](https://caddyserver.com/download).
Drop the binary right into your `local/` folder.

The setup we've created so far is going to need to bind port `443` which
is usually protected by default.  To clear that up, on Ubuntu:

```bash
# This is going to open up port 443 to other machines on the network.
# Only do this if you require that access!
sudo ufw allow 443/tcp

# The main thing is letting caddy listen on port 443 without requiring
# root.  This is fortunately easy!
sudo apt-get install libcap2-bin
sudo setcap 'cap_net_bind_service=+ep' ./local/caddy
```

*Now* you're ready.

```bash
./local/caddy
```

And it all works!  Note that if any of the commands bomb out (say, missing
dependency), you'll have to go in and manually clean up your processes.

Happy development!
