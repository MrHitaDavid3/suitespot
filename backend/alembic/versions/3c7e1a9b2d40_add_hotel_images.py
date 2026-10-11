"""add hotel_images (1.3.1)

Revision ID: 3c7e1a9b2d40
Revises: 880bbb461320
Create Date: 2026-10-11 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3c7e1a9b2d40'
down_revision: Union[str, None] = '880bbb461320'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('hotel_images',
    sa.Column('id', sa.String(length=36), nullable=False),
    sa.Column('hotel_id', sa.String(length=36), nullable=False),
    sa.Column('room_type', sa.String(length=20), nullable=True),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('file', sa.String(length=255), nullable=False),
    sa.Column('alt', sa.String(length=255), nullable=False),
    sa.Column('width', sa.Integer(), nullable=False),
    sa.Column('height', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['hotel_id'], ['hotels.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_hotel_images_hotel_id'), 'hotel_images', ['hotel_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_hotel_images_hotel_id'), table_name='hotel_images')
    op.drop_table('hotel_images')
