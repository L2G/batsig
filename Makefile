plantuml_files        := $(wildcard doc/*.pu)
plantuml_svg_targets  := $(patsubst %.pu,%.svg,${plantuml_files})
plantuml_txt_targets  := $(patsubst %.pu,%.atxt,${plantuml_files})
plantuml_utxt_targets := $(patsubst %.pu,%.utxt,${plantuml_files})

doc/%.svg: doc/%.pu
	plantuml $< -tsvg

doc/%.atxt: doc/%.pu
	plantuml $< -ttxt

doc/%.utxt: doc/%.pu
	plantuml $< -tutxt

uml: ${plantuml_svg_targets} ${plantuml_txt_targets} ${plantuml_utxt_targets}

clean:
	-rm ${plantuml_svg_targets} ${plantuml_txt_targets} ${plantuml_utxt_targets}

all: uml

PHONY: all clean
