# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
from dataclasses import dataclass
from genlayer import *
import genlayer.gl.vm as glvm


DEFAULT_CRITERIA = "logic, creativity, persuasion, evidence, and clarity"
WINNER_XP = 100
RUNNER_UP_XP = 40


@allow_storage
@dataclass
class DebateRoom:
    id: str
    topic: str
    criteria: str
    season: str
    duration_minutes: u256
    status: str
    player_one: str
    player_two: str
    player_one_argument: str
    player_two_argument: str
    winner_slot: str
    winning_player: str
    player_one_score: u256
    player_two_score: u256
    verdict: str


def _score_from(value) -> int:
    score = int(value)
    if score < 0:
        return 0
    if score > 10:
        return 10
    return score


def _is_valid_judgment(judgment: dict) -> bool:
    if not isinstance(judgment, dict):
        return False

    winner = str(judgment.get("winner_slot", ""))
    if winner not in ("player_one", "player_two"):
        return False

    try:
        _score_from(judgment.get("player_one_score", 0))
        _score_from(judgment.get("player_two_score", 0))
    except Exception:
        return False

    verdict = str(judgment.get("verdict", "")).strip()
    return len(verdict) >= 20


class GigaBrain(gl.Contract):
    rooms: TreeMap[str, DebateRoom]
    points: TreeMap[Address, u256]
    next_room_id: u256

    def __init__(self):
        pass

    @gl.public.write
    def create_room(
        self, topic: str, criteria: str, season: str, duration_minutes: u256
    ) -> str:
        minutes = int(duration_minutes)
        if minutes < 5 or minutes > 15:
            raise Exception("Debate rooms must last between 5 and 15 minutes")

        clean_topic = topic.strip()
        if len(clean_topic) < 8:
            raise Exception("Topic is too short")

        clean_season = season.strip()
        if len(clean_season) < 3:
            raise Exception("Season must identify the weekly replay window")

        clean_criteria = criteria.strip() or DEFAULT_CRITERIA
        new_id = int(self.next_room_id) + 1
        self.next_room_id = u256(new_id)
        room_id = f"giga-{new_id}"

        self.rooms[room_id] = DebateRoom(
            id=room_id,
            topic=clean_topic,
            criteria=clean_criteria,
            season=clean_season,
            duration_minutes=u256(minutes),
            status="open",
            player_one=str(gl.message.sender_address),
            player_two="",
            player_one_argument="",
            player_two_argument="",
            winner_slot="",
            winning_player="",
            player_one_score=u256(0),
            player_two_score=u256(0),
            verdict="",
        )

        return room_id

    @gl.public.write
    def join_room(self, room_id: str) -> None:
        if room_id not in self.rooms:
            raise Exception("Room not found")

        room = self.rooms[room_id]
        sender = str(gl.message.sender_address)
        if room.status != "open":
            raise Exception("Room is not open")
        if sender.lower() == room.player_one.lower():
            raise Exception("Creator cannot join their own room")

        room.player_two = sender
        room.status = "arguing"

    @gl.public.write
    def submit_argument(self, room_id: str, argument: str) -> None:
        if room_id not in self.rooms:
            raise Exception("Room not found")

        room = self.rooms[room_id]
        if room.status not in ("arguing", "ready"):
            raise Exception("Room is not accepting arguments")

        sender = str(gl.message.sender_address)
        clean_argument = argument.strip()
        if len(clean_argument) < 30:
            raise Exception("Argument is too short")
        if len(clean_argument) > 2400:
            raise Exception("Argument is too long")

        if sender.lower() == room.player_one.lower():
            if room.player_one_argument:
                raise Exception("Player one already submitted")
            room.player_one_argument = clean_argument
        elif sender.lower() == room.player_two.lower():
            if room.player_two_argument:
                raise Exception("Player two already submitted")
            room.player_two_argument = clean_argument
        else:
            raise Exception("Only room players can submit arguments")

        if room.player_one_argument and room.player_two_argument:
            room.status = "ready"

    def _judge_debate(
        self,
        topic: str,
        criteria: str,
        player_one_argument: str,
        player_two_argument: str,
    ) -> dict:
        def leader_fn() -> dict:
            task = f"""
You are the Giga Brain debate judge.

Topic:
{topic}

Scoring criteria:
{criteria}

Player one argument:
{player_one_argument}

Player two argument:
{player_two_argument}

Choose exactly one winner. Judge the arguments for logic, creativity,
persuasion, and fit to the criteria. Return only valid JSON with:
{{
  "winner_slot": "player_one" or "player_two",
  "player_one_score": integer from 0 to 10,
  "player_two_score": integer from 0 to 10,
  "verdict": string explaining the decision in 1-3 sentences
}}
            """
            return gl.nondet.exec_prompt(task, response_format="json")

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, glvm.Return):
                return False

            judgment = leader_result.calldata
            if not _is_valid_judgment(judgment):
                return False

            validation_task = f"""
You are a validator in GenLayer Optimistic Democracy.

Topic:
{topic}

Criteria:
{criteria}

Player one argument:
{player_one_argument}

Player two argument:
{player_two_argument}

Proposed judgment:
{json.dumps(judgment, sort_keys=True)}

Decide if the proposed judgment is reasonable and follows the requested JSON
schema. You do not need to pick the exact same winner, but you should reject
obvious schema errors, hallucinated facts, irrelevant reasoning, or a verdict
that ignores the debate content. Return only JSON:
{{"valid": true or false}}
            """
            vote = gl.nondet.exec_prompt(validation_task, response_format="json")
            return bool(vote.get("valid", False))

        return glvm.run_nondet_unsafe(leader_fn, validator_fn)

    @gl.public.write
    def judge_room(self, room_id: str) -> None:
        if room_id not in self.rooms:
            raise Exception("Room not found")

        room = self.rooms[room_id]
        if room.status != "ready":
            raise Exception("Room is not ready for judgment")

        judgment = self._judge_debate(
            room.topic,
            room.criteria,
            room.player_one_argument,
            room.player_two_argument,
        )
        if not _is_valid_judgment(judgment):
            raise Exception("Invalid judgment")

        player_one_score = _score_from(judgment["player_one_score"])
        player_two_score = _score_from(judgment["player_two_score"])
        winner_slot = str(judgment["winner_slot"])
        winning_player = room.player_one if winner_slot == "player_one" else room.player_two
        runner_up = room.player_two if winner_slot == "player_one" else room.player_one

        room.winner_slot = winner_slot
        room.winning_player = winning_player
        room.player_one_score = u256(player_one_score)
        room.player_two_score = u256(player_two_score)
        room.verdict = str(judgment["verdict"]).strip()
        room.status = "judged"

        winner_address = Address(winning_player)
        runner_up_address = Address(runner_up)
        self.points[winner_address] = u256(int(self.points.get(winner_address, 0)) + WINNER_XP)
        self.points[runner_up_address] = u256(
            int(self.points.get(runner_up_address, 0)) + RUNNER_UP_XP
        )

    @gl.public.view
    def get_rooms(self) -> dict:
        return {k: v for k, v in self.rooms.items()}

    @gl.public.view
    def get_room(self, room_id: str) -> DebateRoom:
        return self.rooms[room_id]

    @gl.public.view
    def get_points(self) -> dict:
        return {k.as_hex: v for k, v in self.points.items()}

    @gl.public.view
    def get_player_points(self, player_address: str) -> int:
        return int(self.points.get(Address(player_address), 0))
