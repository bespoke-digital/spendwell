
from decimal import Decimal

import graphene
from graphql.core.language import ast


class Money(graphene.Int):
    @staticmethod
    def serialize(decimal):
        return int(decimal / 100)

    @classmethod
    def parse_literal(Cls, node):
        if isinstance(node, ast.IntValue):
            return Cls.parse_value(node)

    @staticmethod
    def parse_value(value):
        return Decimal(value) / Decimal(100)
