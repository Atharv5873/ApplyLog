from datetime import datetime
from bson import ObjectId

class PyOjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
        
    @classmethod
    def validate(cls, value):
        if isinstance(value, ObjectId):
            return value
        try:
            return ObjectId(str(value))
        except Exception as e:
            raise ValueError("Invalid ObjectId") from e

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")