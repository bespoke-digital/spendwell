from django.test import TestCase
from .models import Entry, Category


class BlogPostTest(TestCase):

    def test_create_unpublished(self):
        category = Category.objects.create(name='Personal Finance', primary_color='#121212')
        entry = Entry.objects.create(
            title='Title Me',
            body=' ',
            publish=False,
            category=category,
        )

        self.assertEqual(Entry.objects.all().count(), 1)
        self.assertEqual(Entry.objects.published().count(), 0)

        entry.publish = True
        entry.save()

        self.assertEqual(Entry.objects.published().count(), 1)
