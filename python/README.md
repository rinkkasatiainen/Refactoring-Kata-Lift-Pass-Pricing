# Python version of Lift Pass Pricing Kata

This is originally from [Johan Martinsson](https://github.com/martinsson/Refactoring-Kata-Lift-Pass-Pricing), and adapted
here to change a DB and docker into purely based on accessing file system.

For this python version you will also need to install the dependencies. I recommend you install them in a virtual environment like this:

    python -m venv venv

Check the [Python documentation](https://docs.python.org/3/library/venv.html) for how to activate this environment on your platform. Then install the requirements:

## Requirements (optional, but useful)
Install `virtualenv` and `pipenv` for your computer. This way anything we install on this repository does not mess up any other Python project.


## Before the first session

Make sure you can run the test cases. Steps for doing it:

 - clone this repository
 - run `pipenv shell` on the root of the repo
 - run `pip install -r requirements.txt`
 - run `pipenv install` on the root of the repo (install dependencies)
 - run `pytest` on the root of the repo, or if that does not work

## The following instructions from base repo:

You can run the tests with pytest:

    PYTHONPATH=src python -m pytest

or on Windows Powershell:

    $env:PYTHONPATH='src'; python -m pytest


