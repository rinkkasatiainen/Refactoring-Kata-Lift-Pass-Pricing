# Python version of Lift Pass Pricing Kata

This is originally from [Johan Martinsson](https://github.com/martinsson/Refactoring-Kata-Lift-Pass-Pricing), and adapted
here to change a DB and docker into purely based on accessing file system.

# The important thing

you should be able to run test cases - and to have 3 passing test cases. If you know how to do it, great.
If not, below is steps how I do it.

## Steps to make tests run

For this python version you will also need to install the dependencies. 
I recommend you install them in a virtual environment like this (virtual environment is not necessity):

    python -m venv venv

## Before the first session

Make sure you can run the test cases. Steps for doing it:

 - clone this repository
 - run `pipenv shell` on the root of the repo
 - run `pip install -r requirements.txt`
 - run `pytest` on the root of the repo, or if that does not work ('src' not in path)

## The following instructions from base repo:

You can run the tests with pytest:

    PYTHONPATH=src python -m pytest

or on Windows Powershell:

    $env:PYTHONPATH='src'; python -m pytest


