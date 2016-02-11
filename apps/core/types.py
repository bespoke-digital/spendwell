
from datetime import datetime
from decimal import Decimal
import delorean

from graphene.core.classtypes import Scalar
from graphql.core.language import ast


class Money(Scalar):
    @staticmethod
    def serialize(value):
        return int(value * Decimal(100))

    @staticmethod
    def parse_literal(node):
        if isinstance(node, ast.IntValue):
            return Decimal(node) / Decimal(100)

    @staticmethod
    def parse_value(value):
        return Decimal(value) / Decimal(100)


class Month(Scalar):
    @staticmethod
    def serialize(value):
        if type(value) is datetime:
            return '{:%Y/%m}'.format(value)
        else:
            return value

    @classmethod
    def parse_literal(Cls, node):
        if isinstance(node, ast.StringValue):
            return Cls.parse_value(node.value)

    @staticmethod
    def parse_value(value):
        return delorean.parse(value).truncate('month').datetime
