"""Called from build-scene.py; exports fixed-camera transparent layers."""
from bpy_extras.object_utils import world_to_camera_view

def visible(names):
    for name,collection in groups.items():collection.hide_render=name not in names and name!='Studio'

manifest={'generator':'Blender '+bpy.app.version_string,'cameraOffset':list(CAM_OFFSET),'renderEngine':'Cycles','samples':scene.cycles.samples,'assets':{},'angles':[]}
def render(name,collections,target,ortho,w,h):
    visible(collections);camera(target,ortho,w,h);bpy.context.view_layer.update()
    scene.render.filepath=str(ASSETS/(name+'.png'));bpy.ops.render.render(write_still=True)
    manifest['assets'][name]={'file':name+'.png','width':w,'height':h,'orthoScale':ortho,'cameraTarget':list(target),'transparent':True,'collections':collections}
    print('RENDERED',name,flush=True)

render('rail',['Rail'],(0,0,.15),9.0,1800,190)
render('carriage',['Carriage'],(0,.25,.35),1.75,640,560)
target=(-.35,-.55,.55);scale=2.8;w=h=900
render('lamp-arm',['Arm'],target,scale,w,h)
bpy.context.view_layer.update()
point=world_to_camera_view(scene,cam,pivot)
manifest['lampPivot']={'x':point.x*w,'y':(1-point.y)*h,'canvas':w}
for deg in [-18,-12,-6,0,6,12,18]:
    headroot.rotation_euler.z=math.radians(deg)
    for mode,strength in [('on',2.0),('off',0.0)]:
        emission.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=strength
        lining=ivory.node_tree.nodes.get('Principled BSDF')
        lining.inputs['Emission Color'].default_value=(1,.94,.76,1)
        lining.inputs['Emission Strength'].default_value=.8 if mode=='on' else 0
        name='lamp-head-'+mode+'-'+str(deg+18).zfill(2)
        render(name,['LampHead'],target,scale,w,h)
        bpy.context.view_layer.update()
        mouth=headroot.matrix_world@headroot.matrix_world.inverted()@lamp_point(1.11)
        # Rotate the rest-pose mouth position about the unchanged hinge.
        from mathutils import Matrix
        mouth=pivot+Matrix.Rotation(math.radians(deg),4,'Z').to_3x3()@(lamp_point(1.11)-pivot)
        xy=world_to_camera_view(scene,cam,mouth)
        manifest['angles'].append({'degrees':deg,'lit':mode=='on','file':name+'.png','mouth':{'x':xy.x*w,'y':(1-xy.y)*h}})
headroot.rotation_euler.z=0
emission.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=2
ivory.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=.8
visible(['Rail','Carriage','Arm','LampHead','Paper'])
# Place groups for an editable composed scene; exports above retain clean local coordinates.
for ob in groups['Rail'].objects:ob.location.y-=1.5
for ob in groups['Carriage'].objects:
    ob.location.x+=.6;ob.location.y-=1.5
for ob in groups['Arm'].objects:ob.location+=Vector((-2.8,4.0,0))
headroot.location+=Vector((-2.8,4.0,0))
camera((0,.7,0),9.2,1080,1560)
scene.render.film_transparent=False;scene.render.filepath=str(OUT/'scene-composition.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'typewriter-final.blend'))
bpy.ops.render.render(write_still=True)
(OUT/'asset-manifest.json').write_text(json.dumps(manifest,indent=2))
print('TYPEWRITER_ASSETS_READY',flush=True)
