
from __future__ import print_function
import json

from fabric.api import env, task, prefix, run, cd, shell_env, sudo
from fabric.colors import red, yellow, green, blue

import requests


class DeployFailException:
    pass


@task
def post_to_slack(message):
    requests.post(
        'https://hooks.slack.com/services/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',
        data={'payload': json.dumps({'text': message})},
    )


def configure_env():
    env.hosts = env.apps + env.workers
    env.forward_agent = True
    env.user = 'deploy'
    env.bin = '/data/virtualenv/{venv_name}/bin'.format(**env)
    env.activate = '{bin}/activate'.format(**env)
    env.python = '{bin}/python'.format(**env)
    env.pip = '{bin}/pip'.format(**env)
    env.dir = '/data/web/{domain}'.format(**env)


@task(alias='prod')
def production():
    env.venv_name = 'spendwell'
    env.domain = 'spendwell.co'
    env.settings = 'spendwell.settings.production'
    env.branch = 'master'
    env.apps = ['72.51.30.238', '107.6.24.166']
    env.workers = ['72.51.29.172']
    configure_env()


@task(alias='stag')
def staging(branch='develop'):
    env.venv_name = 'spendwell'
    env.domain = 'staging.spendwell.co'
    env.settings = 'spendwell.settings.staging'
    env.branch = branch
    env.apps = ['162.248.180.146']
    env.workers = ['72.51.29.189']
    configure_env()


@task
def pip_requirements():
    with prefix('source {activate}'.format(**env)):
        with cd(env.dir):
            run('{pip} install -U -r requirements.txt'.format(**env))


@task
def migrate():
    with prefix('source {activate}'.format(**env)):
        with shell_env(DJANGO_SETTINGS_MODULE=env.settings):
            with cd(env.dir):
                run('./manage.py migrate'.format(**env))


@task
def npm_install():
    if env.host in env.workers:
        return

    with cd(env.dir):
        run('npm install')


@task
def npm_build():
    if env.host in env.workers:
        return

    with prefix('source {activate}'.format(**env)):
        with shell_env(DJANGO_SETTINGS_MODULE=env.settings):
            with cd(env.dir):
                run('npm run build-prod')


@task
def collectstatic():
    with prefix('source {activate}'.format(**env)):
        with shell_env(DJANGO_SETTINGS_MODULE=env.settings):
            with cd(env.dir):
                run('./manage.py collectstatic --noinput'.format(**env))


@task
def supervisor_status():
    if env.host in env.workers:
        process_name = 'celery-celeryd'
    else:
        process_name = 'gunicorn-{domain}'.format(**env)

    running = 'RUNNING' in sudo('/usr/bin/supervisorctl status {}'.format(process_name), shell=False)

    if running:
        print(green('supervisor running'))
    else:
        print(red('supervisor not running'))
    return running


@task
def supervisor_restart():
    if env.host in env.workers:
        sudo('/usr/bin/supervisorctl restart celery-celeryd', shell=False)
    else:
        sudo(
            '/usr/bin/supervisorctl status gunicorn-{domain} | '
            'sed "s/.*[pid ]\([0-9]\+\)\,.*/\\1/" | '
            'xargs kill -HUP'.format(**env),
            shell=False,
        )

    return supervisor_status()


@task
def deploy(force=False):
    print(yellow('Deploying to'), blue(env.host))

    try:
        with cd(env.dir):
            old_commit = run('git rev-parse HEAD')
            run('git fetch')
            run('git checkout origin/{branch}'.format(**env))
            new_commit = run('git rev-parse HEAD')

            changed = run('git --no-pager diff --name-only {} {}'.format(old_commit, new_commit))

        if 'requirements.txt' in changed or force:
            pip_requirements()

        if 'migrations' in changed or force:
            migrate()

        package_change = 'package.json' in changed
        if package_change or force:
            npm_install()

        client_change = package_change or 'client/' in changed or 'webpack' in changed
        if client_change or force:
            npm_build()

        static_change = client_change or 'static' in changed
        if static_change or force:
            collectstatic()

        if not supervisor_restart():
            raise DeployFailException

    except Exception as e:
        print(red(e.message))
        print(red('DEPLOY FAILED'))
        post_to_slack('Deploy Failed! `{branch}` to `{domain}`: {}'.format(e.message, **env))
    else:
        print(green('DEPLOY SUCCEEDED!'))
        post_to_slack('Deployed branch `{branch}` to `{domain}`'.format(**env))


@task
def full_deploy():
    deploy(force=True)
