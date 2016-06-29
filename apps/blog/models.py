from django.db import models
from django_markdown.models import MarkdownField
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.template.defaultfilters import slugify
from django.core.urlresolvers import reverse
from taggit.managers import TaggableManager
from resize.fields import ResizedImageField


class EntryQuerySet(models.QuerySet):
    def published(self):
        return self.filter(publish=True)


class Entry(models.Model):
    hero_art = ResizedImageField(
        resolutions=('1920x700', '750x500'),
        help_text="Hero Art will be display at these resolutions '1920x700' and '750x500'"
    )
    title = models.CharField(max_length=200, help_text="Three lines or less")
    body = MarkdownField()
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    publish = models.BooleanField(
        default=False,
        help_text="Only published Posts will show up on blog"
    )
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    category = models.ForeignKey('blog.Category', related_name='entries')
    featured = models.BooleanField(
        default=False,
        help_text="Featured articles will always come before non-featured ones"
    )

    byline_name = models.CharField(max_length=255, blank=True, default='')
    byline_url = models.URLField(blank=True, default='')

    tags = TaggableManager(blank=True)
    objects = EntryQuerySet.as_manager()

    class Meta:
        verbose_name = 'Blog Entry'
        verbose_name_plural = 'Blog Entries'
        ordering = ['-created']

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('blog:entry-detail', kwargs={
            'category_slug': self.category.slug,
            'slug': self.slug,
        })


@receiver(pre_save, sender=Entry)
def entry_pre_save(sender, instance, raw, **kwargs):
    if not raw and not instance.slug:
        instance.slug = generate_slug(Entry.objects, instance.title)


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    primary_color = models.CharField(max_length=7)

    class Meta:
        verbose_name = 'Blog Category'
        verbose_name_plural = 'Blog Categories'

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('blog:category-detail', kwargs={'slug': self.slug})


@receiver(pre_save, sender=Category)
def category_pre_save(sender, instance, raw, **kwargs):
    if not raw and not instance.slug:
        instance.slug = generate_slug(Category.objects, instance.name)


def generate_slug(queryset, title):
    slug_base = slugify(title)[:95].lower()
    slug_iterations = 1
    slug = slug_base
    while queryset.filter(slug=slug).exists():
        slug_iterations += 1
        slug = '{}-{}'.format(slug_base, slug_iterations)
    return slug
