
import json
from datetime import datetime
from decimal import Decimal
import logging

import delorean

from graphene.core.classtypes import Scalar
from graphql.core.language import ast


logger = logging.getLogger(__name__)


class CustomScalar(Scalar):
    base_type = ast.StringValue

    @classmethod
    def parse_literal(Cls, node):
        if isinstance(node, ast.StringValue):
            return Cls.parse_value(node.value)


class Money(CustomScalar):
    base_type = ast.IntValue

    @staticmethod
    def serialize(value):
        return int(Decimal(value) * Decimal(100))

    @staticmethod
    def parse_value(value):
        return Decimal(value) / Decimal(100)


class Month(CustomScalar):
    @staticmethod
    def serialize(value):
        if type(value) is datetime:
            return '{:%Y/%m}'.format(value)
        else:
            return value

    @staticmethod
    def parse_value(value):
        return delorean.parse('{}/01'.format(value)).truncate('month').datetime


class DateTime(CustomScalar):
    @staticmethod
    def serialize(dt):
        return dt.isoformat()

    @staticmethod
    def parse_value(value):
        return datetime.strptime(value, '%Y-%m-%dT%H:%M:%S.%f')


class JSON(CustomScalar):
    @staticmethod
    def serialize(value):
        return json.dumps(value)

    @staticmethod
    def parse_value(value):
        return json.loads(value)
