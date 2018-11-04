import requests

from json import dumps
from flask import Flask, request, session, render_template, jsonify, make_response
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

text = []

channels = {"number one" : [], "number two" : []}

class Message:
    def __init__(self, message, date, user, channel):
        self.message = message
        self.date = date
        self.user = user
        self.channel = channel
    def getDict(self):
        return {"message": self.message, "date": self.date, "user": self.user, "channel": self.channel}

@app.route("/")
def index():
    return render_template("index.html", text=text, channels=channels)

@socketio.on("got message")
def message(data):
    message = Message(data["message"], data["date"], data["user"], "")
    # might not need jsonify
    channels[data["channel"]].append(message.getDict())
    emit("add message", {"message":data["message"],"date": data["date"], "user": data["user"]}, broadcast=True)

@socketio.on("add channel")
def channel(data):
    channels[data["channel"]] = []
    emit("broadcast channel", {"channel":data["channel"]}, broadcast=True)

@app.route("/select_channel", methods=["POST"])
def select_channel():
    channel = request.form.get("channel-name")
    print("Channel Name: " + channel)
    return jsonify({"channel_name" : channels[channel]})

