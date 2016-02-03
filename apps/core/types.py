
from decimal import Decimal

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
