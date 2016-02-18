
from __future__ import print_function

from fabric.api import env, task, prefix, run, cd, shell_env, sudo
from fabric.colors import red, yellow, green, blue
from fabric.contrib import console


class DeployFailException:
    pass


def configure_env():
    env.forward_agent = True
    env.user = 'deploy'
    env.bin = '/data/virtualenv/{venv_name}/bin'.format(**env)
    env.activate = '{bin}/activate'.format(**env)
    env.python = '{bin}/python'.format(**env)
    env.pip = '{bin}/pip'.format(**env)
    env.dir = '/data/web/{domain}'.format(**env)
    env.deployment = 'DEPLOYMENT'
    env.hosts = ['72.51.30.238', '107.6.24.166']


@task(alias='prod')
def production():
    env.venv_name = 'spendwell'
    env.domain = 'spendwell.co'
    env.settings = 'spendwell.settings.production'
    env.branch = 'master'
    configure_env()


@task
def pip_requirements():
    with prefix('source {activate}'.format(**env)):
        with cd(env.dir):
            run('{pip} install -U -r requirements.txt'.format(**env))


@task
def npm_install():
    with cd(env.dir):
        run('npm install')


@task
def npm_build():
    with cd(env.dir):
        run('npm run build-prod')


@task
def collectstatic():
    with prefix('source {activate}'.format(**env)):
        with shell_env(DJANGO_SETTINGS_MODULE=env.settings):
            with cd(env.dir):
                run('./manage.py collectstatic --noinput'.format(**env))


@task
def migrate():
    with prefix('source {activate}'.format(**env)):
        with shell_env(DJANGO_SETTINGS_MODULE=env.settings):
            with cd(env.dir):
                run('./manage.py migrate'.format(**env))


@task
def gunicorn_status():
    running = 'RUNNING' in sudo('/usr/bin/supervisorctl status gunicorn-{domain}'.format(**env), shell=False)
    run('ps aux | grep "gunicorn"')
    if running:
        print(green('gunicorn running'))
    else:
        print(red('gunicorn not running'))
    return running


@task
def gunicorn_restart():
    sudo('/usr/bin/supervisorctl status gunicorn-{domain} | sed "s/.*[pid ]\([0-9]\+\)\,.*/\\1/" | xargs kill -HUP'.format(**env), shell=False)
    return gunicorn_status()


@task
def deploy(force=False, interactive=False):
    print(yellow('Deploying to'), blue(env.host))

    try:
        with cd(env.dir):
            changed = run('git pull origin {branch}'.format(**env))

        if 'requirements.txt' in changed or force:
            if interactive and not console.confirm('Continue with pip_requirements?'):
                return
            pip_requirements()

        if 'migrations' in changed or force:
            if interactive and not console.confirm('Continue with migrate?'):
                return
            migrate()

        if 'package.json' in changed or force:
            if interactive and not console.confirm('Continue with npm_install?'):
                return
            npm_install()

        if 'static' in changed or force:
            if interactive and not console.confirm('Continue with npm_build?'):
                return
            npm_build()

        if 'static' in changed or force:
            if interactive and not console.confirm('Continue with collectstatic?'):
                return
            collectstatic()

        if interactive and not console.confirm('Continue with gunicorn_restart?'):
            return
        if not gunicorn_restart():
            raise DeployFailException

    except Exception as e:
        print(red(e.message))
        print(red('DEPLOY FAILED'))
    else:
        print(green('DEPLOY SUCCEEDED!'))


@task
def full_deploy(interactive=False):
    deploy(force=True, interactive=interactive)
