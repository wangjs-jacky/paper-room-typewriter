"""Original procedural typewriter scene. Run with Blender --background --python."""
import bpy, math, json, sys
from mathutils import Vector
from pathlib import Path

HERE=Path(__file__).resolve().parent
OUT=HERE/'generated'
ASSETS=OUT/'assets'
ASSETS.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for c in list(bpy.data.collections):
    if c.name!='Collection' and c.users==0:bpy.data.collections.remove(c)
scene=bpy.context.scene
groups={}
for name in ['Paper','Rail','Carriage','Arm','LampHead','Studio']:
    c=bpy.data.collections.new(name);scene.collection.children.link(c);groups[name]=c

def group(obj,name):
    for c in list(obj.users_collection):c.objects.unlink(obj)
    groups[name].objects.link(obj)
    return obj

def material(name,color,metal=0,rough=.35):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    return m,p

paint,p=material('Sage enamel · powder coat',(.135,.19,.105),.58,.29)
p.inputs['Coat Weight'].default_value=.32;p.inputs['Coat Roughness'].default_value=.22
noise=paint.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=185
bump=paint.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.07;bump.inputs['Distance'].default_value=.002
paint.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);paint.node_tree.links.new(bump.outputs['Normal'],p.inputs['Normal'])
steel,p=material('Brushed nickel',(.43,.46,.42),.93,.22)
p.inputs['Anisotropic'].default_value=.65
dark,p=material('Oiled gunmetal',(.055,.067,.052),.82,.3)
brass,p=material('Satin brass',(.46,.32,.125),.87,.27)
black,p=material('Rubber and seams',(.025,.029,.023),.05,.55)
ivory,p=material('Warm ivory enamel',(.83,.82,.65),.1,.35)
emission,p=material('Warm opal bulb',(.95,.88,.63),0,.27)
p.inputs['Emission Color'].default_value=(1,.88,.57,1);p.inputs['Emission Strength'].default_value=2.0
paper,p=material('Cotton paper · microfibre',(.76,.735,.655),0,.88)
n=paper.node_tree.nodes.new('ShaderNodeTexNoise');n.inputs['Scale'].default_value=320;n.inputs['Detail'].default_value=3
b=paper.node_tree.nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=.15;b.inputs['Distance'].default_value=.012
paper.node_tree.links.new(n.outputs['Fac'],b.inputs['Height']);paper.node_tree.links.new(b.outputs['Normal'],p.inputs['Normal'])

def finish(obj,name,mat,collection,bevel=0):
    obj.name=name;group(obj,collection)
    if mat:obj.data.materials.append(mat)
    if bevel:
        m=obj.modifiers.new('Machined rounded edge','BEVEL');m.width=bevel;m.segments=4
        m=obj.modifiers.new('Weighted highlights','WEIGHTED_NORMAL');m.keep_sharp=True
    for poly in getattr(obj.data,'polygons',[]):poly.use_smooth=True
    return obj

def box(name,loc,scale,mat,collection,bevel=.04):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,mat,collection,bevel)

def cyl(name,start,end,radius,mat,collection,vertices=64):
    a,b=Vector(start),Vector(end);v=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=v.length,location=(a+b)/2)
    o=bpy.context.object;o.rotation_euler=v.to_track_quat('Z','Y').to_euler()
    return finish(o,name,mat,collection,min(radius*.18,.025))

def sphere(name,loc,scale,mat,collection):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,location=loc);o=bpy.context.object;o.scale=scale
    return finish(o,name,mat,collection)

def torus(name,loc,major,minor,mat,collection,axis=(0,0,1)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=96,minor_segments=12,location=loc)
    o=bpy.context.object;o.rotation_euler=Vector(axis).to_track_quat('Z','Y').to_euler()
    return finish(o,name,mat,collection)

def screw(name,x,y,z,r=.04,collection='Carriage'):
    cyl(name,(x,y,z),(x,y,z+.035),r,brass,collection)
    ob=box(name+' slot',(x,y,z+.039),(r*1.35,.009,.005),black,collection,.002);ob.rotation_euler.z=.35

# Rail: two polished parallel rods, rack, long central bar and captive end mounts.
box('Rack backing',(0,-.075,.12),(8.8,.28,.16),dark,'Rail',.025)
for y,r in [( .19,.070),(-.23,.045)]:
    cyl('Polished guide rod',( -4.6,y,.22),(4.6,y,.22),r,steel,'Rail')
for i in range(155):
    x=-4.55+i*.059
    box('Rack tooth %03d'%i,(x,-.10,.241),(.026,.11,.065),steel,'Rail',.006)
for x in [-4.3,4.3]:
    box('End casting',(x,0,.17),(.25,.69,.38),paint,'Rail',.075)
    screw('Rail bolt',x,-.23,.355,.045,'Rail')
    screw('Rail pin',x,.24,.355,.031,'Rail')

# Carriage: real volume, stepped housings, bearing collars, metal cover and screws.
box('Lower dark housing',(0,-.025,.28),(1.25,.72,.28),dark,'Carriage',.10)
for x in [-.65,.65]:
    cyl('Linear bearing collar',(x-.07,.18,.22),(x+.07,.18,.22),.105,steel,'Carriage')
    cyl('Lower bearing collar',(x-.06,-.23,.22),(x+.06,-.23,.22),.085,dark,'Carriage')
box('Sage enamel body',(0,-.03,.47),(1.15,.72,.40),paint,'Carriage',.08)
box('Nickel top plate',(0,.13,.694),(1.095,.43,.058),steel,'Carriage',.045)
box('Front panel',(0,-.384,.462),(.995,.025,.28),paint,'Carriage',.037)
box('Body seam',(0,-.15,.684),(1.08,.014,.014),dark,'Carriage',.004)
for x in [-.455,.455]:screw('Top cover screw',x,.28,.733,.025)
screw('Brass adjustment screw',.386,-.23,.682,.069)
box('Typebar upright',(-.13,.61,.55),(.055,.43,.08),steel,'Carriage',.015)
box('Typebar elbow',(-.27,.827,.55),(.32,.057,.077),steel,'Carriage',.013)
box('Type slug',(-.43,.845,.57),(.09,.11,.10),brass,'Carriage',.012)
for x in [-.44,-.42]:box('Slug groove',(x,.847,.625),(.008,.083,.008),dark,'Carriage',.001)

# Lamp pivot at the threaded brass joint. The arm is a separate collection.
pivot=Vector((0,0,.7))
cyl('Fixed enamel lamp arm',(-2.15,-.57,.47),(-.03,.035,.71),.064,paint,'Arm')
cyl('Metal inner arm',(-2.15,-.57,.47),(-.03,.035,.71),.033,steel,'Arm')
cyl('Arm end ring',(-.14,-.004,.69),(-.015,.034,.71),.081,brass,'Arm')
sphere('Pivot joint',pivot,(.14,.14,.14),brass,'Arm')
bpy.ops.object.empty_add(type='PLAIN_AXES',location=pivot);headroot=bpy.context.object;headroot.name='LampHeadPivot';group(headroot,'LampHead')
axis=Vector((.17,-.97,-.11)).normalized();q=axis.to_track_quat('Z','Y');base=pivot+axis*.07

def lamp_point(z):return base+axis*z
cyl('Lamp socket',lamp_point(-.15),lamp_point(.20),.13,brass,'LampHead')
for i in range(9):torus('Socket thread %02d'%i,lamp_point(-.13+i*.036),.135,.009,brass,'LampHead',axis)
# Lathed double wall: outer coat, rolled rim and light ivory inside.
profile=[(.15,.142),(.22,.21),(.31,.28),(.44,.35),(.61,.43),(.83,.51),(1.06,.575),(1.11,.577)]
def lathe(name,profile,mat,reverse=False):
    verts=[];faces=[];segments=128
    for z,r in profile:
        for j in range(segments):
            angle=2*math.pi*j/segments
            verts.append(tuple(base+q@Vector((r*math.cos(angle),r*math.sin(angle),z))))
    for k in range(len(profile)-1):
        for j in range(segments):
            a=k*segments+j;b=k*segments+(j+1)%segments;c=b+segments;d=a+segments
            faces.append((d,c,b,a) if reverse else (a,b,c,d))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    ob=bpy.data.objects.new(name,mesh);groups['LampHead'].objects.link(ob);ob.data.materials.append(mat)
    for p in mesh.polygons:p.use_smooth=True
    return ob
lathe('Enamel bell shade',profile,paint)
lathe('Ivory shade interior',[(z+.008,r-.024) for z,r in profile],ivory,True)
torus('Rolled shade lip',lamp_point(1.105),.566,.018,paint,'LampHead',axis)
torus('Warm luminous inside lip',lamp_point(1.106),.544,.008,ivory,'LampHead',axis)
bulb=sphere('Opal bulb',lamp_point(.60),(.17,.17,.25),emission,'LampHead');bulb.rotation_euler=q.to_euler()
bpy.context.view_layer.update()
for ob in list(groups['LampHead'].objects):
    if ob!=headroot:
        matrix=ob.matrix_world.copy();ob.parent=headroot;ob.matrix_world=matrix

# Paper object is retained for scene editing; UI exports omit it.
box('Paper sheet',(0,0,-.08),(8.7,12,.08),paper,'Paper',.10)

world=bpy.data.worlds.new('Soft studio');scene.world=world;world.use_nodes=True
world.node_tree.nodes.get('Background').inputs[0].default_value=(.63,.67,.60,1)
world.node_tree.nodes.get('Background').inputs[1].default_value=.6
def area(name,loc,power,size,color,shape='DISK'):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape=shape;data.size=size;data.color=color
    ob=bpy.data.objects.new(name,data);groups['Studio'].objects.link(ob);ob.location=loc;ob.rotation_euler=(-Vector(loc)).to_track_quat('-Z','Y').to_euler();return ob
area('Large softbox left',(-3,4,7),650,5,(1,.96,.87))
area('Long metal strip',(1,3,5),450,3,(.89,.94,1))
area('Right bounce',(4,-1,4),220,4,(1,.95,.81))
data=bpy.data.cameras.new('Fixed orthographic camera');cam=bpy.data.objects.new('Fixed orthographic camera',data);groups['Studio'].objects.link(cam);scene.camera=cam
CAM_OFFSET=Vector((0,-6,16))
def camera(target,ortho,w,h):
    cam.location=Vector(target)+CAM_OFFSET;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=ortho
    scene.render.resolution_x=w;scene.render.resolution_y=h;scene.render.resolution_percentage=100

scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.use_denoising=True
scene.cycles.max_bounces=6;scene.cycles.transparent_max_bounces=6
scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.image_settings.color_depth='8'
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=.20
try:
    prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='METAL';prefs.get_devices()
    for dev in prefs.devices:dev.use=dev.type=='METAL'
    scene.cycles.device='GPU'
except Exception:scene.cycles.device='CPU'

camera((0,0,0),9.2,1080,1560)
# Store a fully laid out editable scene using parent display empties.
scene['purpose']='Layered web typewriter: original geometry from reference study'
scene['lamp_pivot']=list(pivot);scene['source_reference']='N01 N04 N10 N11 N12'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'typewriter-scene.blend'))
(OUT/'scene-inventory.json').write_text(json.dumps({'blender':bpy.app.version_string,'collections':{k:len(v.objects) for k,v in groups.items()},'lamp_pivot':list(pivot),'camera_offset':list(CAM_OFFSET),'original_geometry':True},indent=2))
print('TYPEWRITER_SCENE_READY',flush=True)

if '--render' in sys.argv:
    exec(compile((HERE/'render-assets.py').read_text(),str(OUT/'render-assets.py'),'exec'))
