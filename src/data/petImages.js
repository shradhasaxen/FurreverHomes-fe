export const PET_IMAGES = {
  dog: [
    'https://w0.peakpx.com/wallpaper/209/34/HD-wallpaper-cute-puppy-dog-dogs-puppies-sweet-white.jpg',
    'https://w0.peakpx.com/wallpaper/785/976/HD-wallpaper-labradoor-dogs-icio.jpg',
    'https://w0.peakpx.com/wallpaper/124/979/HD-wallpaper-perro-calcetin-xdxd-calcetin-dog-perro-random.jpg',
    'https://w0.peakpx.com/wallpaper/460/909/HD-wallpaper-cane-cucciolo-dog-puppies-thumbnail.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7Tai0gHDbS8Z1buOqyz2St7jlYMvE_xhXLg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIP_p9SmFaXQStugD_LdhlGj-3NduwYaEfCQ&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ6oCa7ZBk8HvATA8pTNRIDCMUSoEqm3p8uA&s',
  ],
  cat: [
    'https://w0.peakpx.com/wallpaper/537/555/HD-wallpaper-gato-cat-cats-kitten-thumbnail.jpg',
    'https://w0.peakpx.com/wallpaper/1012/659/HD-wallpaper-cat-cats-cute-dream-pet-pets.jpg',
    'https://w0.peakpx.com/wallpaper/507/556/HD-wallpaper-cat-cats-kittens-little.jpg',
    'https://w0.peakpx.com/wallpaper/20/440/HD-wallpaper-sweet-cat-cats-pets-thumbnail.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6LSMIXwQ7JXr8lk4i-7J0sgK6i60eAnQfvw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTda1um8HKlUr1-mMEzXDseE7bG9zYEWTxMrQ&s',
  ],
  bird: [
    'https://www.avma.org/sites/default/files/media/pet-selection-budgie-with-girl-sm.jpg',
    'https://t3.ftcdn.net/jpg/01/34/10/56/360_F_134105687_seUks63N6yKwgWNkFcu4vJMBYPiaXv5F.jpg',
    'https://media.istockphoto.com/id/1203603072/photo/friendly-cockatiel-parrot-sitting-on-owners-finger.jpg?s=612x612&w=0&k=20&c=IbF04jBn6878aM5EqlE3KginfqK825ZRvlcQ3YS7ouA=',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrIr4CJkHnecDLPR2duYW0iII4PDmVHkm1oQ&s',
  ],
  other: [
    'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&auto=format&fit=crop&q=60',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFjGHWKmCe_7roHSfrh3f1w_eiJDJNBpe1Tg&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbj5_hgBnGjJUOxENBr4jDddyPHYbjHaE1fw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZAfvNrSNXoDiFn8UvPs3eAAkSWF2ga5x0zQ&s',
  ],
}

const counters = { dog: 0, cat: 0, bird: 0, other: 0 }

export function getNextImage(type) {
  const key = counters[type] !== undefined ? type : 'other'
  const arr = PET_IMAGES[key]
  const img = arr[counters[key] % arr.length]
  counters[key]++
  return img
}
